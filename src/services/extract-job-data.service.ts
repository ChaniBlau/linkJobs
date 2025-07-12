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

  const findField = (prefix: string): string | undefined => {
    const raw = lines.find((line, i) => lowerLines[i].startsWith(`${prefix.toLowerCase()}:`));
    return raw?.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '');
  };

  const title = lines.find((line, i) =>
    ['developer', 'engineer', 'fullstack', 'software', 'data'].some(keyword =>
      lowerLines[i].includes(keyword)
    )
  );

  const company = findField('Company');
  const link = lines.find(line => /^https?:\/\//.test(line));
  const location = findField('Location');
  const language = findField('Language');
  const postingDate = new Date();
  const description = text;

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
