import { isJobPost } from "../../../src/services/nlp.service";
import { Keyword } from "@prisma/client";
import redis from "../../../src/config/redis";

describe("isJobPost", () => {
  const baseKeywords: Keyword[] = [
    { id: 1, word: "react", weight: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, word: "developer", weight: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, word: "דרוש", weight: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, word: "מפתח", weight: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() },
  ];

  beforeEach(async () => {
    await redis.sendCommand(['FLUSHALL']); 
  });

  afterAll(async () => {
    await redis.quit(); 
  });

  it("should return true for English match (threshold 2)", async () => {
    const text = "We're hiring a frontend developer with React experience";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(true);
  });

  it("should return true for Hebrew match (threshold 2)", async () => {
    const text = "דרוש/ה מפתח/ת Node.js";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(true);
  });

  it("should return false when no keywords matched", async () => {
    const text = "אני מחפשת מתכון לעוגת שוקולד";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(false);
  });

  it("should return false for partial word match", async () => {
    const text = "reactive patterns are useful";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(false);
  });

  it("should handle punctuation and still match (threshold 2)", async () => {
    const text = "Looking for a React-developer!";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(true);
  });

  it("should return false when only one keyword matches and threshold is 2", async () => {
    const text = "Looking for a React developer";
    const oneKeywordOnly: Keyword[] = [
      { id: 5, word: "react", weight: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() }
    ];
    const result = await isJobPost(text, oneKeywordOnly, 2);
    expect(result).toBe(false);
  });

  it("should return true when only one keyword matches and threshold is 1", async () => {
    const text = "Looking for a React developer";
    const oneKeywordOnly: Keyword[] = [
      { id: 5, word: "react", weight: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() }
    ];
    const result = await isJobPost(text, oneKeywordOnly, 1);
    expect(result).toBe(true);
  });

  it("should return true when two different keywords matched", async () => {
    const text = "דרוש React מומחה";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(true);
  });

  it("should return false for empty text", async () => {
    const result = await isJobPost("", baseKeywords, 2);
    expect(result).toBe(false);
  });

  it("should return false if no keywords given", async () => {
    const text = "We're looking for a developer with React";
    const result = await isJobPost(text, [], 2);
    expect(result).toBe(false);
  });

  it("should not match partial keyword phrases like 'fullstack'", async () => {
    const text = "We need a fullstack ninja";
    const result = await isJobPost(text, baseKeywords, 2);
    expect(result).toBe(false);
  });
});
