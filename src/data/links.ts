/** Only http(s) links are rendered; anything else from package metadata is dropped. */
export function safeHttpUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const HOSTS: Record<string, string> = { github: "github.com", gitlab: "gitlab.com", bitbucket: "bitbucket.org" };

export function normalizeRepoUrl(raw: unknown): string | undefined {
  const value =
    typeof raw === "string" ? raw : typeof raw === "object" && raw !== null ? (raw as { url?: unknown }).url : undefined;
  if (typeof value !== "string") return undefined;
  let url = value.trim();

  const shorthand = /^(?:(github|gitlab|bitbucket):)?([\w.-]+\/[\w.-]+)$/.exec(url);
  if (shorthand) url = `https://${HOSTS[shorthand[1] ?? "github"]}/${shorthand[2]}`;

  url = url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/#.*$/, "")
    .replace(/\.git$/, "");
  return safeHttpUrl(url);
}

export function githubSlug(url: string | undefined): string | undefined {
  const m = url && /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+)/.exec(url);
  return m ? `${m[1]}/${m[2]}` : undefined;
}

export const npmPageUrl = (name: string) => `https://www.npmjs.com/package/${name}`;
