import { Router, type IRouter } from "express";
import {
  GetLeetcodeProfileResponse,
  GetLeetcodeRecentResponse,
} from "@workspace/api-zod";
import { fetchJson, withCache } from "../lib/public-api.js";

const router: IRouter = Router();
const username = "lokeshwarrrrr";
const graphqlUrl = "https://leetcode.com/graphql/";

type LeetcodeGraphqlResponse = {
  data?: {
    matchedUser?: {
      username?: unknown;
      profile?: { ranking?: unknown };
      submitStatsGlobal?: {
        acSubmissionNum?: Array<{ difficulty?: unknown; count?: unknown }>;
      };
    } | null;
    userContestRanking?: { rating?: unknown } | null;
    recentAcSubmissionList?: Array<{
      id?: unknown;
      title?: unknown;
      titleSlug?: unknown;
      timestamp?: unknown;
    }>;
  };
};

const profileQuery = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking }
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
    }
    userContestRanking(username: $username) { rating }
  }
`;

const recentQuery = `
  query recentSubmissions($username: String!, $limit: Int) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

async function leetcodeGraphql(query: string, variables: Record<string, unknown>) {
  const response = await fetchJson<LeetcodeGraphqlResponse>(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com/",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.data) {
    throw new Error("LeetCode returned no data");
  }

  return response.data;
}

function statCount(
  stats: Array<{ difficulty?: unknown; count?: unknown }> | undefined,
  difficulty: string,
) {
  const stat = stats?.find((entry) => entry.difficulty === difficulty);
  return typeof stat?.count === "number" ? stat.count : null;
}

router.get("/leetcode/profile", async (req, res) => {
  try {
    const profile = await withCache("leetcode:profile", async () => {
      const data = await leetcodeGraphql(profileQuery, { username });
      const matchedUser = data.matchedUser;
      if (!matchedUser || typeof matchedUser.username !== "string") {
        throw new Error("LeetCode profile was not found");
      }

      const stats = matchedUser.submitStatsGlobal?.acSubmissionNum;
      return {
        username: matchedUser.username,
        totalSolved: statCount(stats, "All"),
        easySolved: statCount(stats, "Easy"),
        mediumSolved: statCount(stats, "Medium"),
        hardSolved: statCount(stats, "Hard"),
        contestRating:
          typeof data.userContestRanking?.rating === "number"
            ? data.userContestRanking.rating
            : null,
        ranking:
          typeof matchedUser.profile?.ranking === "number"
            ? matchedUser.profile.ranking
            : null,
        acceptanceRate: null,
      };
    });

    res.json(GetLeetcodeProfileResponse.parse(profile));
  } catch (error) {
    req.log.warn({ err: error }, "LeetCode profile unavailable");
    res.status(503).json({
      error: "leetcode_profile_unavailable",
      message: "Live LeetCode stats are temporarily unavailable.",
    });
  }
});

router.get("/leetcode/recent", async (req, res) => {
  try {
    const recent = await withCache("leetcode:recent", async () => {
      const data = await leetcodeGraphql(recentQuery, {
        username,
        limit: 6,
      });

      return (data.recentAcSubmissionList ?? [])
        .filter(
          (problem) =>
            typeof problem.id === "string" &&
            typeof problem.title === "string" &&
            typeof problem.titleSlug === "string",
        )
        .map((problem) => ({
          id: problem.id as string,
          number: null,
          title: problem.title as string,
          difficulty: null,
          topics: [],
          solvedAt:
            typeof problem.timestamp === "string"
              ? new Date(Number(problem.timestamp) * 1_000).toISOString()
              : null,
          url: `https://leetcode.com/problems/${problem.titleSlug as string}/`,
          solutionUrl: null,
        }));
    });

    res.json(GetLeetcodeRecentResponse.parse(recent));
  } catch (error) {
    req.log.warn({ err: error }, "LeetCode recent problems unavailable");
    res.status(503).json({
      error: "leetcode_recent_unavailable",
      message: "Recent LeetCode problems are temporarily unavailable.",
    });
  }
});

export default router;