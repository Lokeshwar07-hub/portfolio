import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API_ROOT = "https://api.github.com";
const DEFAULT_USERNAME = "Lokeshwar07-hub";

// Patches merged into tiny personal or hackathon repositories read as padding
// rather than as open source work, so only established projects are listed.
// Override with OSS_MIN_REPO_STARS (0 disables the filter).
const DEFAULT_MIN_REPO_STARS = 200;

function minRepoStars() {
  const raw = process.env.OSS_MIN_REPO_STARS;
  const parsed = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MIN_REPO_STARS;
}

const LANGUAGE_COLORS = {
  Python: "#3572A5",
  JavaScript: "#F1E05A",
  TypeScript: "#3178C6",
  HTML: "#E34C26",
  "Jupyter Notebook": "#DA5B0B",
  CSS: "#563D7C",
  Other: "#8B949E",
};

function languageColor(name) {
  if (LANGUAGE_COLORS[name]) return LANGUAGE_COLORS[name];

  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360;
  }
  return `hsl(${hash}, 55%, 50%)`;
}

function responseError(url, response) {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const reset = response.headers.get("x-ratelimit-reset");
  const rateLimit =
    remaining === null
      ? ""
      : `, rate limit remaining ${remaining}${reset ? `, resets ${new Date(Number(reset) * 1_000).toISOString()}` : ""}`;
  return new Error(
    `GitHub request failed: ${url} (${response.status} ${response.statusText}${rateLimit})`,
  );
}

async function requestJson(fetchImpl, url, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Lokeshwar07-hub-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetchImpl(url, { headers });
  if (!response.ok) throw responseError(url, response);
  return response.json();
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workerCount = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export function normalizeLanguages(languageBytes) {
  const entries = Object.entries(languageBytes)
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0)
    .sort((a, b) => b[1] - a[1]);
  const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (totalBytes === 0) return [];

  const primary = [];
  let otherBytes = 0;

  for (const [name, bytes] of entries) {
    if ((bytes / totalBytes) * 100 < 1) {
      otherBytes += bytes;
    } else {
      primary.push([name, bytes]);
    }
  }
  if (otherBytes > 0) primary.push(["Other", otherBytes]);

  const apportioned = primary.map(([name, bytes]) => {
    const exactTenths = (bytes / totalBytes) * 1_000;
    return {
      name,
      bytes,
      tenths: Math.floor(exactTenths),
      remainder: exactTenths - Math.floor(exactTenths),
    };
  });

  let remainingTenths =
    1_000 - apportioned.reduce((sum, language) => sum + language.tenths, 0);
  const remainderOrder = [...apportioned].sort(
    (a, b) => b.remainder - a.remainder || b.bytes - a.bytes,
  );
  for (let index = 0; index < remainingTenths; index += 1) {
    remainderOrder[index % remainderOrder.length].tenths += 1;
  }

  return apportioned
    .filter(({ tenths }) => tenths > 0)
    .map(({ name, bytes, tenths }) => ({
      name,
      bytes,
      percentage: tenths / 10,
      color: languageColor(name),
    }));
}

const CONTRIBUTIONS_QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

const SNAPSHOT_QUERY_HEAD = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    name
    createdAt
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazerCount
        forkCount
        languages(first: 100) {
          edges { size node { name } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

// Merged pull requests authored by the account, folded into the same request as
// the snapshot so the whole refresh still costs a single GraphQL call.
const MERGED_PRS_FIELD = `
  search(query: "is:pr is:merged author:__LOGIN__ sort:updated-desc", type: ISSUE, first: 100) {
    issueCount
    nodes {
      ... on PullRequest {
        number
        title
        mergedAt
        url
        repository {
          nameWithOwner
          stargazerCount
          owner { login }
        }
      }
    }
  }`;

function snapshotQuery(login) {
  const field = MERGED_PRS_FIELD.replace("__LOGIN__", login);
  return SNAPSHOT_QUERY_HEAD.replace(/\}\s*$/, `${field}\n}`);
}

function parseContributionsCollection(collection) {
  if (!collection?.contributionCalendar?.weeks) return null;

  const weeks = collection.contributionCalendar.weeks
    .map((week) => ({
      days: (week.contributionDays || []).map((day) => ({
        date: day.date,
        count: day.contributionCount,
      })),
    }))
    .filter((week) => week.days.length > 0);

  return {
    totalContributions: collection.contributionCalendar.totalContributions ?? 0,
    totalPullRequests: collection.totalPullRequestContributions ?? 0,
    totalIssues: collection.totalIssueContributions ?? 0,
    weeks,
  };
}

async function graphqlRequest(fetchImpl, url, token, body) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "Lokeshwar07-hub-portfolio",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw responseError(url, response);
  const payload = await response.json();
  if (payload.errors) throw new Error(payload.errors.map((e) => e.message).join("; "));
  return payload.data;
}

async function fetchContributions({ fetchImpl, username, token, warn }) {
  if (!token) return null;
  try {
    const data = await graphqlRequest(fetchImpl, "https://api.github.com/graphql", token, {
      query: CONTRIBUTIONS_QUERY,
      variables: { login: username },
    });
    return parseContributionsCollection(data?.user?.contributionsCollection);
  } catch (error) {
    warn?.(`Contributions fetch failed; heatmap will be hidden: ${error.message}`);
    return null;
  }
}

export function normalizeOpenSource(nodes, username, { minStars = 0, starsKnown = true } = {}) {
  const repositories = new Map();

  for (const node of nodes ?? []) {
    const number = node?.number;
    const title = node?.title;
    const repository = node?.repository;
    const fullName = repository?.nameWithOwner;
    const owner = repository?.owner?.login;
    const mergedAt = node?.mergedAt;

    if (
      !Number.isInteger(number) ||
      typeof title !== "string" ||
      title.length === 0 ||
      typeof fullName !== "string" ||
      !fullName.includes("/") ||
      typeof mergedAt !== "string" ||
      Number.isNaN(Date.parse(mergedAt))
    ) {
      continue;
    }
    // Contributions to your own repositories are not open source work.
    if (typeof owner === "string" && owner.toLowerCase() === username.toLowerCase()) {
      continue;
    }

    const existing = repositories.get(fullName) ?? {
      repo: fullName.split("/")[1],
      fullName,
      url: `https://github.com/${fullName}`,
      stars: Number.isFinite(repository?.stargazerCount) ? repository.stargazerCount : 0,
      prs: [],
    };

    existing.prs.push({
      id: number,
      title,
      mergedAt: new Date(mergedAt).toISOString(),
      url: node.url ?? `https://github.com/${fullName}/pull/${number}`,
    });
    repositories.set(fullName, existing);
  }

  return [...repositories.values()]
    .map((repository) => ({
      ...repository,
      prs: repository.prs.sort(
        (a, b) => Date.parse(b.mergedAt) - Date.parse(a.mergedAt),
      ),
    }))
    .filter((repository) => !starsKnown || repository.stars >= minStars)
    .sort(
      (a, b) =>
        b.prs.length - a.prs.length ||
        Date.parse(b.prs[0].mergedAt) - Date.parse(a.prs[0].mergedAt),
    );
}

async function fetchOpenSourceRest({ fetchImpl, username, token, warn }) {
  try {
    const url = new URL(`${API_ROOT}/search/issues`);
    url.searchParams.set("q", `is:pr is:merged author:${username}`);
    url.searchParams.set("sort", "updated");
    url.searchParams.set("per_page", "100");
    const payload = await requestJson(fetchImpl, url, token);
    if (!Array.isArray(payload?.items)) return null;

    const repositories = normalizeOpenSource(
      payload.items.map((item) => ({
        number: item.number,
        title: item.title,
        mergedAt: item.pull_request?.merged_at ?? null,
        url: item.html_url,
        repository: {
          nameWithOwner: item.repository_url?.split("/repos/")[1] ?? null,
          stargazerCount: 0,
          owner: {
            login: item.repository_url?.split("/repos/")[1]?.split("/")[0],
          },
        },
      })),
      username,
      { minStars: 0, starsKnown: false },
    );

    return {
      repositories,
      totalCount: Number.isFinite(payload.total_count) ? payload.total_count : null,
    };
  } catch (error) {
    warn?.(`Merged PR fetch failed; open source list will use the last snapshot: ${error.message}`);
    return null;
  }
}

async function fetchGithubSnapshotGraphQL({ fetchImpl, username, token, warn, now }) {
  // A single GraphQL request replaces ~1 + N REST calls (user, repo pages,
  // one languages call per repository), which keeps well clear of the
  // unauthenticated 60/hour REST rate limit.
  const languageBytes = {};
  const repositories = [];
  let displayName = username;
  let memberSince = null;
  let followers = 0;
  let contributions = null;
  let openSource = null;
  let mergedPullRequestCount = null;
  let cursor = null;

  for (let page = 1; ; page += 1) {
    const data = await graphqlRequest(fetchImpl, "https://api.github.com/graphql", token, {
      query: snapshotQuery(username),
      variables: { login: username, cursor },
    });

    const user = data?.user;
    if (!user?.repositories) {
      throw new Error("GitHub GraphQL returned invalid snapshot data");
    }

    displayName = user.name || displayName;
    if (memberSince === null) {
      memberSince = new Date(user.createdAt).getUTCFullYear();
      followers = user.followers?.totalCount ?? 0;
      contributions = parseContributionsCollection(user.contributionsCollection);
      const allOpenSource = normalizeOpenSource(data?.search?.nodes, username);
      const threshold = minRepoStars();
      openSource =
        threshold > 0
          ? allOpenSource.filter((repository) => repository.stars >= threshold)
          : allOpenSource;
      const hidden = allOpenSource.length - openSource.length;
      if (hidden > 0) {
        warn?.(
          `Open source list: hid ${hidden} merged-PR repo(s) below ${threshold} stars`,
        );
      }
      mergedPullRequestCount = Number.isFinite(data?.search?.issueCount)
        ? data.search.issueCount
        : null;
    }

    repositories.push(...(user.repositories.nodes ?? []));
    for (const repository of user.repositories.nodes ?? []) {
      for (const edge of repository.languages?.edges ?? []) {
        const name = edge?.node?.name;
        if (!name || !Number.isFinite(edge.size) || edge.size < 0) continue;
        languageBytes[name] = (languageBytes[name] ?? 0) + edge.size;
      }
    }

    if (!user.repositories.pageInfo?.hasNextPage) break;
    cursor = user.repositories.pageInfo.endCursor;
    if (!cursor) break;
  }

  return {
    username,
    displayName,
    memberSince,
    followers,
    publicRepositoryCount: repositories.length,
    totalStars: repositories.reduce((sum, r) => sum + (r.stargazerCount || 0), 0),
    totalForks: repositories.reduce((sum, r) => sum + (r.forkCount || 0), 0),
    contributions,
    openSource,
    mergedPullRequestCount,
    languages: normalizeLanguages(languageBytes),
    generatedAt: now().toISOString(),
  };
}

export async function fetchGithubSnapshot({
  fetchImpl = fetch,
  username = DEFAULT_USERNAME,
  token,
  concurrency = 6,
  now = () => new Date(),
  warn = console.warn,
} = {}) {
  const encodedUsername = encodeURIComponent(username);

  // Prefer the single-request GraphQL snapshot when a token is available;
  // fall back to the REST pipeline if GraphQL fails for any reason.
  if (token) {
    try {
      return await fetchGithubSnapshotGraphQL({
        fetchImpl,
        username,
        token,
        warn,
        now,
      });
    } catch (error) {
      warn?.(
        `GraphQL snapshot failed; falling back to REST pipeline: ${error.message}`,
      );
    }
  }

  const userUrl = `${API_ROOT}/users/${encodedUsername}`;
  const user = await requestJson(fetchImpl, userUrl, token);

  const repositories = [];
  const perPage = 100;
  for (let page = 1; ; page += 1) {
    const url = new URL(`${API_ROOT}/users/${encodedUsername}/repos`);
    url.searchParams.set("type", "owner");
    url.searchParams.set("sort", "updated");
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    const pageRepositories = await requestJson(fetchImpl, url, token);
    if (!Array.isArray(pageRepositories)) {
      throw new Error(`GitHub returned invalid repository data: ${url}`);
    }
    repositories.push(...pageRepositories);
    if (pageRepositories.length < perPage) break;
  }

  const languageResults = await mapWithConcurrency(
    repositories,
    concurrency,
    async (repository) => {
      try {
        return await requestJson(fetchImpl, repository.languages_url, token);
      } catch (error) {
        // A single language failure (e.g. a secondary rate limit hit) should
        // not discard the entire snapshot; skip it and continue.
        warn?.(
          `Language fetch failed for ${repository.name ?? repository.id}; skipping: ${error.message}`,
        );
        return null;
      }
    },
  );
  const languageBytes = {};
  let languageFailureCount = 0;
  for (const result of languageResults) {
    if (!result) {
      languageFailureCount += 1;
      continue;
    }
    if (Array.isArray(result) || typeof result !== "object") {
      throw new Error("GitHub returned invalid language data");
    }
    for (const [name, bytes] of Object.entries(result)) {
      if (!Number.isFinite(bytes) || bytes < 0) {
        throw new Error(`GitHub returned invalid byte count for ${name}`);
      }
      languageBytes[name] = (languageBytes[name] ?? 0) + bytes;
    }
  }
  if (repositories.length > 0 && languageFailureCount === repositories.length) {
    throw new Error("All repository language fetches failed");
  }

  const contributions = await fetchContributions({
    fetchImpl,
    username,
    token,
    warn,
  });

  const openSourceResult = await fetchOpenSourceRest({
    fetchImpl,
    username,
    token,
    warn,
  });

  return {
    username,
    displayName: user.name || username,
    memberSince: new Date(user.created_at).getUTCFullYear(),
    followers: user.followers ?? 0,
    publicRepositoryCount: repositories.length,
    totalStars: repositories.reduce(
      (sum, repository) => sum + (repository.stargazers_count || 0),
      0,
    ),
    totalForks: repositories.reduce(
      (sum, repository) => sum + (repository.forks_count || 0),
      0,
    ),
    contributions,
    openSource: openSourceResult?.repositories ?? null,
    mergedPullRequestCount: openSourceResult?.totalCount ?? null,
    languages: normalizeLanguages(languageBytes),
    generatedAt: now().toISOString(),
  };
}

export function isValidSnapshot(value) {
  if (!value || typeof value !== "object") return false;
  const integerFields = [
    value.memberSince,
    value.publicRepositoryCount,
    value.totalStars,
    value.totalForks,
    value.followers ?? 0,
  ];
  if (
    typeof value.username !== "string" ||
    value.username.length === 0 ||
    typeof value.displayName !== "string" ||
    value.displayName.length === 0 ||
    integerFields.some((field) => !Number.isInteger(field) || field < 0) ||
    !Array.isArray(value.languages) ||
    Number.isNaN(Date.parse(value.generatedAt))
  ) {
    return false;
  }

  if (value.contributions != null) {
    const contributions = value.contributions;
    if (
      typeof contributions !== "object" ||
      !Number.isInteger(contributions.totalContributions) ||
      contributions.totalContributions < 0 ||
      !Array.isArray(contributions.weeks)
    ) {
      return false;
    }
    const validWeeks = contributions.weeks.every(
      (week) =>
        week &&
        Array.isArray(week.days) &&
        week.days.every(
          (day) =>
            day &&
            typeof day.date === "string" &&
            !Number.isNaN(Date.parse(day.date)) &&
            Number.isInteger(day.count) &&
            day.count >= 0,
        ),
    );
    if (!validWeeks) return false;
  }

  if (
    value.mergedPullRequestCount != null &&
    (!Number.isInteger(value.mergedPullRequestCount) ||
      value.mergedPullRequestCount < 0)
  ) {
    return false;
  }

  if (value.openSource != null) {
    const validOpenSource =
      Array.isArray(value.openSource) &&
      value.openSource.every(
        (repository) =>
          repository &&
          typeof repository.fullName === "string" &&
          repository.fullName.includes("/") &&
          typeof repository.url === "string" &&
          Array.isArray(repository.prs) &&
          repository.prs.length > 0 &&
          repository.prs.every(
            (pr) =>
              pr &&
              Number.isInteger(pr.id) &&
              typeof pr.title === "string" &&
              !Number.isNaN(Date.parse(pr.mergedAt)),
          ),
      );
    if (!validOpenSource) return false;
  }

  const validLanguages = value.languages.every(
    (language) =>
      language &&
      typeof language.name === "string" &&
      Number.isFinite(language.bytes) &&
      language.bytes > 0 &&
      Number.isFinite(language.percentage) &&
      language.percentage > 0 &&
      typeof language.color === "string",
  );
  if (!validLanguages) return false;
  if (value.languages.length === 0) return true;

  const totalPercentage = value.languages.reduce(
    (sum, language) => sum + language.percentage,
    0,
  );
  return Math.abs(totalPercentage - 100) < 0.001;
}

async function readValidSnapshot(outputPath) {
  try {
    const snapshot = JSON.parse(await readFile(outputPath, "utf8"));
    return isValidSnapshot(snapshot) ? snapshot : null;
  } catch {
    return null;
  }
}

export async function refreshSnapshot({
  outputPath,
  load,
  warn = console.warn,
}) {
  try {
    const snapshot = await load();
    if (!isValidSnapshot(snapshot)) {
      throw new Error("Generated GitHub snapshot failed validation");
    }

    await mkdir(dirname(outputPath), { recursive: true });
    const temporaryPath = `${outputPath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporaryPath, outputPath);
    return snapshot;
  } catch (error) {
    const previousSnapshot = await readValidSnapshot(outputPath);
    if (!previousSnapshot) throw error;
    warn(`GitHub stats refresh failed; keeping the previous snapshot: ${error.message}`);
    return previousSnapshot;
  }
}

async function main() {
  const outputPath = resolve("src/data/github-stats.json");
  const snapshot = await refreshSnapshot({
    outputPath,
    load: () =>
      fetchGithubSnapshot({
        username: DEFAULT_USERNAME,
        token: process.env.GITHUB_TOKEN,
      }),
  });
  console.log(
    `GitHub stats ready: ${snapshot.publicRepositoryCount} repositories, generated ${snapshot.generatedAt}`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
