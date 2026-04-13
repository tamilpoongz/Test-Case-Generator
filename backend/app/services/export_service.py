import csv
import io
import json
from app.models.response import TestCaseResponse


class ExportService:
    """Export test cases to various formats."""
    
    @staticmethod
    def to_csv(test_cases: list) -> str:
        """Export test cases as CSV."""
        output = io.StringIO()
        
        fieldnames = [
            'Test Case ID',
            'Test Case Title',
            'Test Type',
            'Preconditions',
            'Test Steps',
            'Test Data',
            'Expected Result',
            'Priority',
            'Confidence Score',
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for tc in test_cases:
            tc_dict = tc if isinstance(tc, dict) else tc.model_dump()
            writer.writerow({
                'Test Case ID': tc_dict.get('test_case_id', ''),
                'Test Case Title': tc_dict.get('test_case_title', ''),
                'Test Type': tc_dict.get('test_type', ''),
                'Preconditions': '; '.join(tc_dict.get('preconditions', [])),
                'Test Steps': '; '.join(tc_dict.get('test_steps', [])),
                'Test Data': '; '.join(tc_dict.get('test_data', [])),
                'Expected Result': tc_dict.get('expected_result', ''),
                'Priority': tc_dict.get('priority', ''),
                'Confidence Score': f"{float(tc_dict.get('confidence_score', 0)):.2f}",
            })
        
        return output.getvalue()
    
    @staticmethod
    def to_json(test_cases: list) -> str:
        """Export test cases as JSON."""
        data = []
        for tc in test_cases:
            if isinstance(tc, dict):
                data.append(tc)
            else:
                data.append(tc.model_dump())
        return json.dumps(data, indent=2)


export_service = ExportService()
