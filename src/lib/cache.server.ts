type CacheRecord<T> = { value: T; expiresAt: number };

const memoryCache = new Map<string, CacheRecord<unknown>>();

function now() {
  return Date.now();
}

function getMemory<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= now()) {
    memoryCache.delete(key);
    return null;
  }
  return cached.value as T;
}

function setMemory<T>(key: string, value: T, ttlSeconds: number) {
  memoryCache.set(key, { value, expiresAt: now() + ttlSeconds * 1000 });
}

async function getRedis<T>(key: string): Promise<T | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;
  const url = `${base}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const body = (await res.json()) as { result?: string | null };
  if (!body.result) return null;
  return JSON.parse(body.result) as T;
}

async function setRedis<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return;
  const encoded = encodeURIComponent(JSON.stringify(value));
  const url = `${base}/setex/${encodeURIComponent(key)}/${ttlSeconds}/${encoded}`;
  await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getOrSetServerCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const memoryValue = getMemory<T>(key);
  if (memoryValue !== null) return memoryValue;

  try {
    const redisValue = await getRedis<T>(key);
    if (redisValue !== null) {
      setMemory(key, redisValue, ttlSeconds);
      return redisValue;
    }
  } catch {
    // Ignore Redis failures; app keeps working with memory/direct fetch.
  }

  const loaded = await loader();
  setMemory(key, loaded, ttlSeconds);
  try {
    await setRedis(key, loaded, ttlSeconds);
  } catch {
    // Ignore write failures; this is an optimization only.
  }
  return loaded;
}
