export type ExtractedJobData = {
  title: string;
  company: string;
  description: string;
  postingDate: Date;
  link: string;
  location?: string;
  language?: string;
  organizationId: number;
  groupId: number;
};

export function extractJobDataFromText(text: string): Partial<ExtractedJobData> | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lowerLines = lines.map(line => line.toLowerCase());

  const title = lines.find((line, i) =>
    lowerLines[i].includes('developer') || lowerLines[i].includes('engineer')
  );

  const companyRaw = lines.find((line, i) =>
    lowerLines[i].startsWith('company:')
  );
  const company = companyRaw?.replace(/^company:\s*/i, '');

  const link = lines.find(line => line.startsWith('http'));

  const locationRaw = lines.find((line, i) =>
    lowerLines[i].startsWith('location:')
  );
  const location = locationRaw?.replace(/^location:\s*/i, '');

  const languageRaw = lines.find((line, i) =>
    lowerLines[i].startsWith('language:')
  );
  const language = languageRaw?.replace(/^language:\s*/i, '');

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
