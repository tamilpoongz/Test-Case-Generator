/**
 * Transform acceptance criteria text into array
 * Splits by newlines and removes empty items
 */
export const transformAcceptanceCriteria = (text: string): string[] => {
  if (!text || typeof text !== 'string') return [];

  return text
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^[\d+.)\-•*]\s*/, '')
        .trim()
    )
    .filter((line) => line.length > 0);
};

/**
 * Download file from blob
 */
export const downloadFile = (blob: Blob, filename: string): void => {
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
export const formatConfidenceScore = (score: number | undefined): string => {
  if (typeof score !== 'number') return '0%';
  return `${Math.round(score * 100)}%`;
};

/**
 * Get background color for a confidence score
 */
export const getConfidenceColor = (score: number | undefined): string => {
  const value = typeof score === 'number' ? score : 0;
  if (value >= 0.85) return '#10b981'; // green
  if (value >= 0.65) return '#f59e0b'; // amber
  return '#ef4444'; // red
};
