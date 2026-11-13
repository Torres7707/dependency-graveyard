export class HttpError extends Error {
  readonly status: number;
  constructor(status: number, url: string) {
    super(`HTTP ${status} for ${url}`);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function getJson(url: string, signal?: AbortSignal, headers?: HeadersInit): Promise<unknown> {
  const res = await fetch(url, { signal, headers });
  if (!res.ok) throw new HttpError(res.status, url);
  return res.json();
}

export const isNotFound = (error: unknown) => error instanceof HttpError && error.status === 404;
