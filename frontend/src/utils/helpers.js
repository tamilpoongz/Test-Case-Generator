/**
 * Transform acceptance criteria text into array
 * Splits by newlines and removes empty items
 */
export const transformAcceptanceCriteria = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  return text
    .split('\n')
    .map(line => {
      // Remove bullet points, numbers, dashes
      return line
        .trim()
        .replace(/^[\d+.)\-•*]\s*/, '')
        .trim();
    })
    .filter(line => line.length > 0);
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format confidence score as percentage
 */
export const formatConfidenceScore = (score) => {
  if (typeof score !== 'number') return '0%';
  return `${Math.round(score * 100)}%`;
};

/**
 * Get color for confidence score
 */
export const getConfidenceColor = (score) => {
  if (score >= 0.8) return '#4caf50'; // green
  if (score >= 0.6) return '#ff9800'; // orange
  return '#f44336'; // red
};
