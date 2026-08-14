type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export class PublicDataError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "PublicDataError";
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(8_000),
      headers: {
        Accept: "application/json",
        "User-Agent": "Lokeshwar-Sikarwar-Portfolio/1.0",
        ...init.headers,
      },
    });
  } catch (error) {
    throw new PublicDataError(
      error instanceof Error ? error.message : "Public data request failed",
    );
  }

  if (!response.ok) {
    throw new PublicDataError(
      `Public data request returned ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function withCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 5 * 60 * 1_000,
): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await loader();
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}