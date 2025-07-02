import { isJobPost } from "../../../src/services/nlp.service";
import { Keyword } from "@prisma/client";

describe("isJobPost", () => {
  const keywords: Keyword[] = [
    {
      id: 1,
      word: "react",
      weight: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      word: "דרוש",
      weight: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  it("should return true for English match", () => {
    const text = "We're hiring a frontend developer with React experience";
    expect(isJobPost(text, keywords)).toBe(true);
  });

  it("should return true for Hebrew match", () => {
    const text = "דרוש/ה מפתח/ת Node.js";
    expect(isJobPost(text, keywords)).toBe(true);
  });

  it("should return false when no keywords matched", () => {
    const text = "אני מחפשת מתכון לעוגת שוקולד";
    expect(isJobPost(text, keywords)).toBe(false);
  });
});
