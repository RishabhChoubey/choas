import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Message, messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { Session } from "@/types/typings";
import { revalidateTag } from "next/cache";
export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
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
    const [userId1, userId2] = chatId.split("--");

    if (session.id !== userId1 && session.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = session.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      "friendList",
      `user:${session.id}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSender = (await fetchRedis(
      "get",
      "rawSender",
      `user:${session.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as Session;

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.id,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    // notify all connected chat room clients
    await pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      message
    );

    await pusherServer.trigger(
      toPusherKey(`user:${friendId}:chats`),
      "new_message",
      {
        ...message,
        senderImg: sender.image,
        senderName: sender.name,
      }
    );

    // all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });
    revalidateTag("chatMessage");
    revalidateTag("lastMessage");
    return new Response("OK");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
