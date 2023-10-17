import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Session } from "@/types/typings";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const user: User | null = await currentUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const session: Session = {
      id: user.id,
      name: user.firstName,
      email: user.emailAddresses[0].emailAddress,
      image: user.imageUrl,
    };

    // verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      "isAlreadyFriend",
      `user:${session.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      "hasFriend",
      `user:${session.id}:incoming_friend_requests`,
      idToAdd
    );

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", "userRaw", `user:${session.id}`),
      fetchRedis("get", "friendRaw", `user:${idToAdd}`),
    ])) as [string, string];

    const users = JSON.parse(userRaw) as Session;
    const friend = JSON.parse(friendRaw) as Session;

    // notify added user

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        users
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.id}:friends`),
        "new_friend",
        friend
      ),
      db.sadd(`user:${session.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.id),
      db.srem(`user:${session.id}:incoming_friend_requests`, idToAdd),
    ]);

    return new Response("OK");
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
