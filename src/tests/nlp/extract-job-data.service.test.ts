import { extractJobDataFromText } from "../../services/extract-job-data.service";

describe('extractJobDataFromText', () => {

  it('should extract full job data from a well-formatted post', () => {
    const post = `
      We're hiring a Fullstack Developer!
      Company: Wix
      Location: Tel Aviv
      Language: Hebrew
      https://linkedin.com/jobs/123
    `;

    const result = extractJobDataFromText(post);

    expect(result).toBeTruthy();
    expect(result?.title).toContain('Developer');
    expect(result?.company).toBe('Wix');
    expect(result?.link).toContain('http');
    expect(result?.location).toBe('Tel Aviv');
    expect(result?.language).toBe('Hebrew');
    expect(result?.description).toBe(post);
    expect(result?.postingDate).toBeInstanceOf(Date);
  });

  it('should return null if title is missing', () => {
    const post = `
      Company: Wix
      https://linkedin.com/jobs/123
    `;

    const result = extractJobDataFromText(post);

    expect(result).toBeNull();
  });

  it('should return null if company is missing', () => {
    const post = `
      We are hiring a Backend Developer!
      https://linkedin.com/jobs/456
    `;

    const result = extractJobDataFromText(post);

    expect(result).toBeNull();
  });

  it('should return null if link is missing', () => {
    const post = `
      Frontend Developer
      Company: Meta
    `;

    const result = extractJobDataFromText(post);

    expect(result).toBeNull();
  });

  it('should be case-insensitive in matching company/location/language', () => {
    const post = `
      React Developer
      COMPANY: Google
      LOCATION: Haifa
      LANGUAGE: English
      https://linkedin.com/jobs/789
    `;

    const result = extractJobDataFromText(post);

    expect(result?.company).toBe('Google');
    expect(result?.location).toBe('Haifa');
    expect(result?.language).toBe('English');
  });

  it('should find the first valid link anywhere in the post', () => {
    const post = `
    React Developer
    Company: Zoominfo
    Check this out:
    https://linkedin.com/jobs/123
    Apply now!
  `;
    const result = extractJobDataFromText(post);
    expect(result).toBeTruthy();
    expect(result?.link).toContain('linkedin.com');
  });



});
