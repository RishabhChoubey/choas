import { Redis } from "@upstash/redis";

function getDbDetails() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log(url + " " + token);
  if (!url || url.length === 0) {
    throw new Error("Missing Url");
  }

  if (!token || token.length === 0) {
    throw new Error("Missing Token");
  }
  console.log(url + " db ///////////////////// " + token);
  return { url, token };
}
export const db = new Redis({
  url: getDbDetails().url,
  token: getDbDetails().token,
});
