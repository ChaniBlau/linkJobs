import { Keyword } from "@prisma/client";

export function isJobPost(text: string, keywords: Keyword[]): boolean {
    const loweredText = text.toLowerCase();
    return keywords.some(keyword =>
        loweredText.includes(keyword.word.toLowerCase())
    );
}
