import { Router, type IRouter } from "express";
import {
  GetGithubActivityResponse,
  GetGithubContributionsResponse,
  GetGithubReposResponse,
} from "@workspace/api-zod";
import { fetchJson, withCache } from "../lib/public-api";

const router: IRouter = Router();
const username = "Lokeshwar07-hub";
const githubBaseUrl = "https://api.github.com";

type GithubRepositoryApi = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  html_url?: unknown;
  language?: unknown;
  stargazers_count?: unknown;
  forks_count?: unknown;
  updated_at?: unknown;
  topics?: unknown;
};

type GithubEventApi = {
  id?: unknown;
  type?: unknown;
  repo?: { name?: unknown; url?: unknown };
  created_at?: unknown;
  payload?: {
    ref?: unknown;
    action?: unknown;
    issue?: { title?: unknown };
    pull_request?: { title?: unknown };
  };
};

type ContributionPayload = {
  contributions?: unknown;
};

function normalizeRepository(repo: GithubRepositoryApi) {
  if (
    typeof repo.id !== "number" ||
    typeof repo.name !== "string" ||
    typeof repo.html_url !== "string" ||
    typeof repo.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: repo.id,
    name: repo.name,
    description: typeof repo.description === "string" ? repo.description : null,
    htmlUrl: repo.html_url,
    language: typeof repo.language === "string" ? repo.language : null,
    stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
    forks: typeof repo.forks_count === "number" ? repo.forks_count : 0,
    updatedAt: repo.updated_at,
    topics: Array.isArray(repo.topics)
      ? repo.topics.filter((topic): topic is string => typeof topic === "string")
      : [],
  };
}

function activitySummary(event: GithubEventApi) {
  const type = typeof event.type === "string" ? event.type : "PublicEvent";
  const payload = event.payload;

  if (type === "PushEvent") {
    const ref = typeof payload?.ref === "string" ? payload.ref : "a branch";
    return `Pushed changes to ${ref.replace("refs/heads/", "")}`;
  }

  if (type === "CreateEvent") {
    return "Created a repository or branch";
  }

  if (type === "IssuesEvent") {
    const title =
      typeof payload?.issue?.title === "string"
        ? `: ${payload.issue.title}`
        : "";
    return `${String(payload?.action ?? "Updated")} an issue${title}`;
  }

  if (type === "PullRequestEvent") {
    const title =
      typeof payload?.pull_request?.title === "string"
        ? `: ${payload.pull_request.title}`
        : "";
    return `${String(payload?.action ?? "Updated")} a pull request${title}`;
  }

  return "Recent public GitHub activity";
}

router.get("/github/repos", async (req, res) => {
  try {
    const repositories = await withCache("github:repos", async () => {
      const response = await fetchJson<GithubRepositoryApi[]>(
        `${githubBaseUrl}/users/${username}/repos?per_page=100&sort=updated`,
      );
      return response
        .map(normalizeRepository)
        .filter((repo): repo is NonNullable<ReturnType<typeof normalizeRepository>> => Boolean(repo))
        .slice(0, 8);
    });

    res.json(GetGithubReposResponse.parse(repositories));
  } catch (error) {
    req.log.warn({ err: error }, "GitHub repositories unavailable");
    res.status(503).json({
      error: "github_repositories_unavailable",
      message: "Live GitHub repositories are temporarily unavailable.",
    });
  }
});

router.get("/github/activity", async (req, res) => {
  try {
    const activity = await withCache("github:activity", async () => {
      const events = await fetchJson<GithubEventApi[]>(
        `${githubBaseUrl}/users/${username}/events/public?per_page=10`,
      );

      return events
        .filter(
          (event) =>
            typeof event.id === "string" &&
            typeof event.created_at === "string" &&
            typeof event.repo?.name === "string" &&
            typeof event.repo.url === "string",
        )
        .slice(0, 6)
        .map((event) => ({
          id: event.id as string,
          type: typeof event.type === "string" ? event.type : "PublicEvent",
          repoName: event.repo?.name as string,
          repoUrl: `https://github.com/${event.repo?.name as string}`,
          createdAt: event.created_at as string,
          summary: activitySummary(event),
        }));
    });

    res.json(GetGithubActivityResponse.parse(activity));
  } catch (error) {
    req.log.warn({ err: error }, "GitHub activity unavailable");
    res.status(503).json({
      error: "github_activity_unavailable",
      message: "Live GitHub activity is temporarily unavailable.",
    });
  }
});

router.get("/github/contributions", async (req, res) => {
  try {
    const contributions = await withCache("github:contributions", async () => {
      const payload = await fetchJson<ContributionPayload>(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      );
      const days = Array.isArray(payload.contributions)
        ? payload.contributions
            .map((day) => {
              if (!day || typeof day !== "object") return null;
              const record = day as Record<string, unknown>;
              if (typeof record.date !== "string") return null;
              return {
                date: record.date,
                count: typeof record.count === "number" ? record.count : 0,
                level: typeof record.level === "number" ? record.level : 0,
              };
            })
            .filter(
              (
                day,
              ): day is { date: string; count: number; level: number } =>
                Boolean(day),
            )
        : [];

      if (!days.length) {
        throw new Error("Contribution response was empty");
      }

      return {
        total: days.reduce((total, day) => total + day.count, 0),
        days,
      };
    });

    res.json(GetGithubContributionsResponse.parse(contributions));
  } catch (error) {
    req.log.warn({ err: error }, "GitHub contributions unavailable");
    res.status(503).json({
      error: "github_contributions_unavailable",
      message: "Live GitHub contribution data is temporarily unavailable.",
    });
  }
});

export default router;