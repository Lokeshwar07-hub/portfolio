
/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import snapshotJson from "@/data/github-stats.json";
import { Code2 } from "lucide-react";


interface GithubSnapshot {
  username: string;
  displayName: string;
  followers?: number;
  totalStars: number;
  contributions?: {
    totalContributions: number;
    totalPullRequests?: number;
    totalIssues?: number;
    weeks: { days: { date: string; count: number }[] }[];
  } | null;
  languages: { name: string; percentage: number; color: string }[];
}

const snapshot = snapshotJson as GithubSnapshot;

const tileBase =
  "group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/40 p-4 transition-all duration-300 hover:border-primary/40 hover:bg-card/70 hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30";

function heatmapLevel(count: number) {
  if (count <= 0) return "bg-foreground/[0.06]";
  if (count <= 2) return "bg-primary/30";
  if (count <= 5) return "bg-primary/55";
  if (count <= 9) return "bg-primary/80";
  return "bg-primary";
}

function Heatmap({
  contributions,
}: {
  contributions: NonNullable<GithubSnapshot["contributions"]>;
}) {
  const weeks = contributions.weeks.slice(-40);

  return (
    <div className="flex-1 min-h-0 flex items-center">
      <div
        className="grid grid-flow-col grid-rows-7 gap-[2px] w-full"
        aria-label={`Contribution heatmap, ${contributions.totalContributions} contributions in the last year`}
      >
        {weeks.map((week, weekIndex) =>
          week.days.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              title={`${day.count} contributions on ${day.date}`}
              className={cn(
                "aspect-square rounded-[2px]",
                heatmapLevel(day.count),
              )}
            />
          )),
        )}
      </div>
    </div>
  );
}

function StatDot({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function GithubTile() {
  const { contributions } = snapshot;

  return (
    <a
      href={`https://github.com/${snapshot.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(tileBase, "gap-3 min-h-[280px]")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent" />

      {/* GitHub Profile */}
      <div className="relative flex items-center gap-3">
        <img
          src={`https://github.com/${snapshot.username}.png`}
          alt={snapshot.displayName}
          className="size-10 rounded-full ring-2 ring-border object-cover"
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">
            {snapshot.displayName}
          </p>

          <p className="text-xs text-muted-foreground truncate">
            @{snapshot.username}
          </p>
        </div>
      </div>

      {/* Contribution Heatmap */}
      {contributions ? (
        <Heatmap contributions={contributions} />
      ) : (
        <div className="flex min-h-[76px] items-center justify-center rounded-md bg-foreground/[0.03] text-xs text-muted-foreground">
          Contribution activity unavailable
        </div>
      )}

      {/* GitHub Statistics */}
      <div className="relative grid grid-cols-2 gap-x-3 gap-y-1.5">
        <StatDot
          color="#f87171"
          label="Stars"
          value={snapshot.totalStars}
        />

        <StatDot
          color="#c084fc"
          label="Followers"
          value={snapshot.followers ?? 0}
        />

        <StatDot
          color="#60a5fa"
          label="PRs"
          value={contributions?.totalPullRequests ?? 0}
        />

        <StatDot
          color="#e5e7eb"
          label="Issues"
          value={contributions?.totalIssues ?? 0}
        />
      </div>

      {/* Programming Languages */}
      {snapshot.languages.length > 0 && (
        <div className="relative flex h-1.5 w-full overflow-hidden rounded-full">
          {snapshot.languages
            .filter((language) => language.percentage > 0)
            .slice(0, 6)
            .map((language) => (
              <div
                key={language.name}
                style={{
                  width: `${language.percentage}%`,
                  backgroundColor: language.color,
                }}
                title={`${language.name}: ${language.percentage}%`}
              />
            ))}
        </div>
      )}
    </a>
  );
}

function LeetCodeTile() {
  return (
    <a
      href="https://leetcode.com/u/lokeshwarrrrr/"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        tileBase,
        "justify-center gap-8 min-h-[280px] p-6",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-background/50">
          <Code2 className="size-5 text-primary" />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold">LeetCode</p>
          <p className="text-xs text-muted-foreground">
            @lokeshwarrrrr
          </p>
        </div>
      </div>

      

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold tabular-nums">79</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Problems Solved
          </p>
        </div>

        <div>
          <p className="text-3xl font-bold tabular-nums">2.0M</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Global Rank
          </p>
        </div>
      </div>

      <p className="mt-auto text-xs text-muted-foreground">
        View full LeetCode profile ↗
      </p>
    </a>
  );
}

export default function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
      <GithubTile />
      <LeetCodeTile />
    </div>
  );
}
