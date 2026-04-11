/**
 * Count the number of words in a text string
 * @param {string} text - The text to count words in
 * @returns {number} - The number of words
 */
export function countWords(text) {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  return text.trim().split(/\s+/).length;
}
