import axios from "axios";
import { ENV } from "./_core/env";

export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface RedditMeResponse {
  name: string;
  id: string;
  icon_img: string;
}

export interface RedditPostResponse {
  json: {
    errors: string[][];
    data?: {
      url: string;
      name: string; // fullname like t3_xxxxx
      id: string;
    };
  };
}

const REDDIT_BASE = "https://www.reddit.com";
const REDDIT_OAUTH_BASE = "https://oauth.reddit.com";
const REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/authorize";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

export function getRedditAuthUrl(state: string, redirectUri: string): string {
  const clientId = ENV.redditClientId;
  const scopes = ["identity", "submit", "privatemessages", "read"].join(" ");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
    redirect_uri: redirectUri,
    duration: "permanent",
    scope: scopes,
  });
  return `${REDDIT_AUTH_URL}?${params.toString()}`;
}

export async function exchangeRedditCode(
  code: string,
  redirectUri: string
): Promise<RedditTokenResponse> {
  const clientId = ENV.redditClientId;
  const clientSecret = ENV.redditClientSecret;

  const response = await axios.post<RedditTokenResponse>(
    REDDIT_TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    {
      auth: { username: clientId, password: clientSecret },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data;
}

export async function refreshRedditToken(
  refreshToken: string
): Promise<RedditTokenResponse> {
  const clientId = ENV.redditClientId;
  const clientSecret = ENV.redditClientSecret;

  const response = await axios.post<RedditTokenResponse>(
    REDDIT_TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      auth: { username: clientId, password: clientSecret },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data;
}

// App-only OAuth token cache (client credentials flow — no user login needed)
let appOnlyToken: { token: string; expiresAt: number } | null = null;

export async function getAppOnlyRedditToken(): Promise<string | null> {
  const clientId = ENV.redditClientId;
  const clientSecret = ENV.redditClientSecret;
  if (!clientId || !clientSecret) return null;

  const now = Date.now();
  if (appOnlyToken && appOnlyToken.expiresAt - now > 60_000) {
    return appOnlyToken.token;
  }

  try {
    const response = await axios.post<RedditTokenResponse>(
      REDDIT_TOKEN_URL,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: { username: clientId, password: clientSecret },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    appOnlyToken = {
      token: response.data.access_token,
      expiresAt: now + response.data.expires_in * 1000,
    };
    return appOnlyToken.token;
  } catch (err) {
    console.error("[Reddit] Failed to get app-only token:", err);
    return null;
  }
}

export async function getRedditMe(accessToken: string): Promise<RedditMeResponse> {
  const response = await axios.get<RedditMeResponse>(`${REDDIT_OAUTH_BASE}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "SubRoast/1.0 by SubRoastApp",
    },
  });
  return response.data;
}

export async function submitRedditPost(
  accessToken: string,
  subreddit: string,
  title: string,
  text: string
): Promise<{ postId: string; postUrl: string }> {
  const response = await axios.post<RedditPostResponse>(
    `${REDDIT_OAUTH_BASE}/api/submit`,
    new URLSearchParams({
      sr: subreddit,
      kind: "self",
      title,
      text,
      resubmit: "true",
      nsfw: "false",
      spoiler: "false",
    }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "SubRoast/1.0 by SubRoastApp",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = response.data.json;
  if (data.errors && data.errors.length > 0) {
    throw new Error(`Reddit API error: ${data.errors.map((e) => e.join(": ")).join(", ")}`);
  }
  if (!data.data) {
    throw new Error("Reddit API returned no post data");
  }

  return {
    postId: data.data.id,
    postUrl: data.data.url,
  };
}

export async function postRedditComment(
  accessToken: string,
  thingId: string, // fullname of the post, e.g. "t3_abc123"
  text: string
): Promise<{ commentId: string }> {
  const response = await axios.post(
    `${REDDIT_OAUTH_BASE}/api/comment`,
    new URLSearchParams({
      thing_id: thingId,
      text,
      return_rtjson: "false",
    }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "SubRoast/1.0 by SubRoastApp",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const json = response.data?.json;
  if (json?.errors && json.errors.length > 0) {
    throw new Error(`Reddit comment error: ${json.errors.map((e: string[]) => e.join(": ")).join(", ")}`);
  }
  const commentId: string = json?.data?.things?.[0]?.data?.id ?? "";
  return { commentId };
}

export async function sendRedditDM(
  accessToken: string,
  toUsername: string,
  subject: string,
  text: string
): Promise<void> {
  const response = await axios.post(
    `${REDDIT_OAUTH_BASE}/api/compose`,
    new URLSearchParams({
      to: toUsername,
      subject,
      text,
    }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "SubRoast/1.0 by SubRoastApp",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const json = response.data?.json;
  if (json?.errors && json.errors.length > 0) {
    throw new Error(`Reddit DM error: ${json.errors.map((e: string[]) => e.join(": ")).join(", ")}`);
  }
}
