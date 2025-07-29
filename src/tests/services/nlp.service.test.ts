import { isJobPost } from "../../../src/services/nlp.service";
import { Keyword } from "@prisma/client";

describe("isJobPost", () => {
  const baseKeywords: Keyword[] = [
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
      word: "developer",
      weight: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      word: "דרוש",
      weight: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      word: "מפתח",
      weight: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  it("should return true for English match (threshold 2)", () => {
    const text = "We're hiring a frontend developer with React experience";
    expect(isJobPost(text, baseKeywords, 2)).toBe(true);
  });

  it("should return true for Hebrew match (threshold 2)", () => {
    const text = "דרוש/ה מפתח/ת Node.js";
    expect(isJobPost(text, baseKeywords, 2)).toBe(true);
  });

  it("should return false when no keywords matched", () => {
    const text = "אני מחפשת מתכון לעוגת שוקולד";
    expect(isJobPost(text, baseKeywords, 2)).toBe(false);
  });

  it("should return false for partial word match", () => {
    const text = "reactive patterns are useful";
    expect(isJobPost(text, baseKeywords, 2)).toBe(false);
  });

  it("should handle punctuation and still match (threshold 2)", () => {
    const text = "Looking for a React-developer!";
    expect(isJobPost(text, baseKeywords, 2)).toBe(true);
  });

  it("should return false when only one keyword matches and threshold is 2", () => {
    const text = "Looking for a React developer";
    const oneKeywordOnly: Keyword[] = [
      {
        id: 5,
        word: "react",
        weight: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    expect(isJobPost(text, oneKeywordOnly, 2)).toBe(false);
  });

  it("should return true when only one keyword matches and threshold is 1", () => {
    const text = "Looking for a React developer";
    const oneKeywordOnly: Keyword[] = [
      {
        id: 5,
        word: "react",
        weight: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    expect(isJobPost(text, oneKeywordOnly, 1)).toBe(true);
  });

  it("should return true when two different keywords matched", () => {
    const text = "דרוש React מומחה";
    expect(isJobPost(text, baseKeywords, 2)).toBe(true);
  });

  it("should return false for empty text", () => {
    const text = "";
    expect(isJobPost(text, baseKeywords, 2)).toBe(false);
  });

  it("should return false if no keywords given", () => {
    const text = "We're looking for a developer with React";
    expect(isJobPost(text, [], 2)).toBe(false);
  });

  it("should not match partial keyword phrases like 'fullstack'", () => {
    const text = "We need a fullstack ninja";
    expect(isJobPost(text, baseKeywords, 2)).toBe(false);
  });

});
