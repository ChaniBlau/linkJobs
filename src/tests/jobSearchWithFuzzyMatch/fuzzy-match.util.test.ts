import { getSimilarityScore } from "../../utils/fuzzy-match.util";

// נשתיק את הלוגים בטסט
jest.mock('../../utils/logger', () => ({
  warn: jest.fn(),
}));

describe('getSimilarityScore', () => {
  const keywords = ['developer', 'react', 'engineer', 'backend'];

  it('should return a positive score for relevant post', () => {
    const text = 'We are looking for a React developer to join our backend team';
    const score = getSimilarityScore(text, keywords);
    expect(score).toBeGreaterThan(0);
  });

  it('should return 0 for unrelated text', () => {
    const text = 'Cooking recipes and health tips for the weekend';
    const score = getSimilarityScore(text, keywords);
    expect(score).toBe(0);
  });

  it('should ignore case and punctuation', () => {
    const text = 'React!!! Developer? Backend';
    const score = getSimilarityScore(text, keywords);
    expect(score).toBeGreaterThanOrEqual(2); // יכול להיות גם 3
  });

  it('should return 0 if keywords list is empty', () => {
    const text = 'We are hiring React engineers!';
    const score = getSimilarityScore(text, []);
    expect(score).toBe(0);
  });

  it('should return 0 for empty text', () => {
    const score = getSimilarityScore('', keywords);
    expect(score).toBe(0);
  });

  it('should return 0 if text is undefined', () => {
    const score = getSimilarityScore(undefined as unknown as string, keywords);
    expect(score).toBe(0);
  });

  it('should return 0 if text is null', () => {
    const score = getSimilarityScore(null as unknown as string, keywords);
    expect(score).toBe(0);
  });

  it('should return 0 if both text and keywords are empty', () => {
    const score = getSimilarityScore('', []);
    expect(score).toBe(0);
  });
});
