import { Session } from "@/types/typings";
import { fetchRedis } from "./redis";
import { db } from "@/lib/db";

export const getFriendsByUserId = async (userId: string) => {
  // retrieve friends for current user

  console.log("userid", userId);
  const friendIds = (await fetchRedis(
    "smembers",
    "friendIds",
    `user:${userId}:friends`
  )) as string[];
  console.log("friend ids", friendIds);

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis(
        "get",
        "friend",
        `user:${friendId}`
      )) as string;
      const parsedFriend = JSON.parse(friend) as User;
      return parsedFriend;
    })
  );

  return friends;
};
export const adduser = async (userId: string, session: Session) => {
  // retrieve friends for current user

  console.log("add user ,ethode ", userId);
  const res = await db.set(`user:${userId}`, session);
  await db.set(`user:email:${session.email}`, session.id);
  console.log(res + "  set userr");
};
