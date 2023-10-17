import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { Session } from "@/types/typings";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";

import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      "get",
      "idToAdd",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) {
      return new Response("This person does not exist.", { status: 400 });
    }

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

    if (idToAdd === session.id) {
      return new Response("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      "isAlreadyAdded",
      `user:${idToAdd}:incoming_friend_requests`,
      session.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    // check if user is already added
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      "isAlreadyFriend",
      `user:${session.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

    // valid request, send friend request

    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.id,
        senderEmail: session.email,
      }
    );

    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.id);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
