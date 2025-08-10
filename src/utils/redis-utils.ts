import redis from '../config/redis';

export const setCache = async (key: string, value: any, ttlSeconds = 3600): Promise<void> => {
  const stringified = JSON.stringify(value);
  await redis.set(key, stringified, { EX: ttlSeconds }); // שמירה עם זמן תפוגה
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};
