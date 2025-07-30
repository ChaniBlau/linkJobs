export type ExtractedJobData = {
  title: string;
  company: string;
  description: string;
  postingDate: Date;
  link: string;
  location?: string;
  language?: string;
};

export function extractJobDataFromText(text: string): Partial<ExtractedJobData> | null {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const lowerLines = lines.map(line => line.toLowerCase());

  // General function to find a field by prefix (like: Company: X)
  const findField = (prefix: string): string | undefined => {
    const raw = lines.find((line, i) => lowerLines[i].startsWith(`${prefix.toLowerCase()}:`));
    return raw?.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '');
  };

  // Title identification – first by prefix, if not then by general words
  const titleFromPrefix = findField('Title');
  const titleByKeywords = lines.find((line, i) =>
    ['developer', 'engineer', 'fullstack', 'software', 'data', 'qa', 'product', 'backend', 'frontend']
      .some(keyword => lowerLines[i].includes(keyword))
  );
  const title = titleFromPrefix || titleByKeywords;

  const company = findField('Company');
  const location = findField('Location');
  const language = findField('Language');
  const postingDate = new Date();
  const description = text;

  // Try to find a link – prefer a link post on LinkedIn
  const link = lines.find(line =>
    /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(line) || /^https?:\/\//.test(line)
  );

  if (!title || !company || !link) {
    return null;
  }

  return {
    title,
    company,
    link,
    description,
    postingDate,
    location,
    language,
  };
}
