import logging
import json
import time
from typing import Optional
from groq import Groq
from app.config import settings
from app.exceptions.custom_exceptions import LLMError

logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with LLM provider."""
    
    def __init__(self):
        logger.info(f"Initializing LLM Service with provider: {settings.LLM_PROVIDER}")
        logger.info(f"Using model: {settings.LLM_MODEL}")
        
        if settings.LLM_PROVIDER == "groq":
            self.client = Groq(api_key=settings.LLM_API_KEY)
        else:
            raise LLMError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")
        
        self.model = settings.LLM_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.max_retries = 3
    
    def invoke(
        self,
        system_prompt: str,
        user_message: str,
        max_retries: int = 3
    ) -> str:
        """
        Invoke LLM with system and user messages.
        
        Args:
            system_prompt: System role prompt
            user_message: User query
            max_retries: Number of retries on failure
        
        Returns:
            LLM response text
        
        Raises:
            LLMError: If LLM invocation fails after retries
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"LLM invocation attempt {attempt + 1}/{max_retries}")
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                )
                logger.info(f"LLM invocation successful (attempt {attempt + 1})")
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"LLM error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)  # Exponential backoff
                else:
                    raise LLMError(f"Failed after {max_retries} attempts: {str(e)}")
    
    def invoke_json(
        self,
        system_prompt: str,
        user_message: str
    ) -> dict:
        """Invoke LLM expecting JSON response with robust parsing."""
        response_text = self.invoke(system_prompt, user_message)
        
        logger.debug(f"Raw LLM response: {response_text[:500]}...")  # Log first 500 chars
        
        # Try to parse directly first
        if response_text:
            response_text = response_text.strip()
        
        if not response_text:
            logger.error("LLM returned empty response")
            raise LLMError("LLM returned empty response")
        
        # Try 1: Direct JSON parse
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            logger.info("Direct JSON parse failed, attempting extraction...")
        
        # Try 2: Extract JSON from markdown code blocks
        try:
            if "```json" in response_text:
                json_content = response_text.split("```json")[1].split("```")[0].strip()
                logger.info("Extracted JSON from markdown code block")
                return json.loads(json_content)
        except (json.JSONDecodeError, IndexError) as e:
            logger.info("Markdown extraction failed, attempting general extraction...")
        
        # Try 3: Extract JSON from plain code blocks
        try:
            if "```" in response_text:
                json_content = response_text.split("```")[1].strip()
                logger.info("Extracted JSON from plain code block")
                return json.loads(json_content)
        except (json.JSONDecodeError, IndexError):
            logger.info("Plain code block extraction failed...")
        
        # Try 4: Find and extract first JSON object/array
        try:
            import re
            # Find first { or [
            start_idx = -1
            for i, char in enumerate(response_text):
                if char in '{[':
                    start_idx = i
                    break
            
            if start_idx != -1:
                # Try to find matching closing bracket
                brace_count = 0
                bracket_count = 0
                is_parsing_object = response_text[start_idx] == '{'
                
                for end_idx in range(start_idx, len(response_text)):
                    char = response_text[end_idx]
                    
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if is_parsing_object and brace_count == 0:
                            json_content = response_text[start_idx:end_idx+1]
                            logger.info("Extracted JSON from response using bracket matching")
                            return json.loads(json_content)
                    
                    elif char == '[':
                        bracket_count += 1
                    elif char == ']':
                        bracket_count -= 1
                        if not is_parsing_object and bracket_count == 0:
                            json_content = response_text[start_idx:end_idx+1]
                            logger.info("Extracted JSON array from response")
                            return json.loads(json_content)
        except Exception as e:
            logger.warning(f"JSON extraction via bracket matching failed: {str(e)}")
        
        # If all parsing attempts fail, log detailed error
        logger.error(f"All JSON parsing attempts failed")
        logger.error(f"Response text (first 1000 chars): {response_text[:1000]}")
        logger.error(f"Response length: {len(response_text)}")
        raise LLMError(f"Invalid JSON response - could not parse: {response_text[:100]}")


# Global LLM service instance
llm_service = None

def get_llm_service():
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service
