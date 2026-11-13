import { useQuery } from "@tanstack/react-query";
import { CACHE_STALE_MS } from "@/domain/config";
import { getJson } from "./http";
import { githubSlug, normalizeRepoUrl, safeHttpUrl } from "./links";

export interface PackageInfo {
  description?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  stars?: number;
  openIssues?: number;
}

function text(value: unknown, max = 400): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;
}

async function fetchPackageInfo(name: string, signal: AbortSignal): Promise<PackageInfo> {
  const doc = (await getJson(`https://registry.npmjs.org/${name.replace("/", "%2F")}/latest`, signal)) as Record<string, unknown>;
  const license = doc.license;
  const info: PackageInfo = {
    description: text(doc.description),
    license: text(typeof license === "object" && license !== null ? (license as { type?: unknown }).type : license, 60),
    homepage: safeHttpUrl(doc.homepage),
    repository: normalizeRepoUrl(doc.repository),
  };

  const slug = githubSlug(info.repository);
  if (slug) {
    try {
      const project = (await getJson(
        `https://api.deps.dev/v3/projects/${encodeURIComponent(`github.com/${slug}`)}`,
        signal,
      )) as { starsCount?: unknown; openIssuesCount?: unknown };
      if (typeof project.starsCount === "number") info.stars = project.starsCount;
      if (typeof project.openIssuesCount === "number") info.openIssues = project.openIssuesCount;
    } catch {
      // Stars are a nice-to-have; the dialog works without them.
    }
  }
  return info;
}

/** Loaded only when a detail dialog opens, so summoning stays at two requests per package. */
export function usePackageInfo(name: string | null | undefined) {
  return useQuery({
    queryKey: ["info", name],
    queryFn: ({ signal }) => fetchPackageInfo(name!, signal),
    enabled: !!name,
    staleTime: CACHE_STALE_MS,
    retry: 1,
  });
}
