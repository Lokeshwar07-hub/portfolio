/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import githubStats from "@/data/github-stats.json";
import { GitMerge, Star } from "lucide-react";

const PREVIEW_COUNT = 4;

interface OpenSourcePr {
  id: number;
  title: string;
  mergedAt?: string;
  url?: string;
}

interface OpenSourceRepo {
  repo: string;
  fullName: string;
  url: string;
  stars: number;
  prs: OpenSourcePr[];
}

function formatMergedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function OpenSourceSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  // const manualLogos = useMemo(() => {
  //   const logos: Record<string, string> = {};
  //   for (const repo of DATA.openSource) {
  //     logos[repo.fullName] = repo.logoUrl;
  //   }
  //   return logos;
  // }, []);
  const manualLogos: Record<string, string> = {};
  const repositories: OpenSourceRepo[] = useMemo(() => {
    const fromGitHub = githubStats.openSource;

    if (Array.isArray(fromGitHub) && fromGitHub.length > 0) {
      return fromGitHub as OpenSourceRepo[];
    }

    return [];
  }, []);

  const totalMerged = repositories.reduce(
    (sum, repository) => sum + repository.prs.length,
    0,
  );

  return (
    <div className="flex min-h-0 flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <BlurFade inView>
          <h2 className="text-xl font-bold tracking-tight">Open Source</h2>
        </BlurFade>
        <BlurFade inView delay={0.05}>
          <p className="text-sm text-muted-foreground">
            Merged patches I&apos;ve shipped to projects I don&apos;t own, synced
            from the GitHub API.{" "}
            <span className="text-foreground font-medium">{totalMerged} merged</span>{" "}
            PRs across{" "}
            <span className="text-foreground font-medium">
              {repositories.length} repos
            </span>
            .
          </p>
        </BlurFade>
      </div>
      <div className="flex flex-col gap-4">
        {repositories.map((repo, index) => {
          const isOpen = expanded === repo.fullName;
          const visiblePrs = isOpen ? repo.prs : repo.prs.slice(0, PREVIEW_COUNT);
          const logo =
            manualLogos[repo.fullName] ??
            `https://github.com/${repo.fullName.split("/")[0]}.png?size=80`;
          return (
            <BlurFade key={repo.fullName} inView delay={index * 0.06}>
              <div className="group rounded-xl border border-border/70 bg-card/40 p-4 md:p-5 transition-colors hover:border-primary/40 hover:bg-card/60">
                <div className="flex items-center gap-x-3">
                  <img
                    src={logo}
                    alt={repo.repo}
                    loading="lazy"
                    className="size-9 p-1 border rounded-lg ring-1 ring-border object-contain bg-background/60"
                  />
                  <div className="flex-1 min-w-0">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold leading-tight hover:text-primary transition-colors truncate block w-fit max-w-full"
                    >
                      {repo.fullName}
                    </a>
                    <p className="text-xs text-muted-foreground">Open Source</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground flex-none">
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Star className="size-3.5" aria-hidden />
                        {repo.stars >= 1000
                          ? `${(repo.stars / 1000).toFixed(1)}k`
                          : repo.stars}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <GitMerge className="size-3.5 text-primary" aria-hidden />
                      {repo.prs.length} merged
                    </span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {visiblePrs.map((pr) => (
                    <li key={pr.id} className="flex items-center gap-2 text-sm min-w-0">
                      <GitMerge className="size-3.5 flex-none text-primary" aria-hidden />
                      <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary tabular-nums flex-none">
                        Merged
                      </span>
                      <a
                        href={pr.url ?? `https://github.com/${repo.fullName}/pull/${pr.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors truncate hover:underline underline-offset-4"
                      >
                        {pr.title}
                      </a>
                      <span className="ml-auto text-xs text-muted-foreground/70 tabular-nums flex-none">
                        {formatMergedAt(pr.mergedAt) ?? `#${pr.id}`}
                      </span>
                    </li>
                  ))}
                </ul>
                {repo.prs.length > PREVIEW_COUNT && (
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : repo.fullName)}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {isOpen ? "Show less" : `Show all ${repo.prs.length}`}
                  </button>
                )}
              </div>
            </BlurFade>
          );
        })}
      </div>
    </div>
  );
}