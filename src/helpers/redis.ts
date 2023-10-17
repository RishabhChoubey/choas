const upstashRedisRestUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
const authToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;

console.log(
  process.env.UPSTASH_REDIS_REST_URL +
    "        " +
    process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL
);
import axios from "axios";
import { revalidateTag } from "next/cache";

type Command = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis(
  command: Command,
  tag: string,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`;
  console.log("fetch Redis " + commandUrl + "      tag     " + tag);
  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    // cache: "no-store",
    next: { tags: [tag] },
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data);
  return data.result;
}
