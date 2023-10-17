import FriendRequests from "@/components/FriendRequests";
import { adduser } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { Session } from "@/types/typings";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { notFound } from "next/navigation";
import { FC } from "react";

const page = async () => {
  const user: User | null = await currentUser();
  if (user == null) notFound();
  console.log(user + "  ///////////////////////////////////");
  const session: Session = {
    id: user.id,
    name: user.firstName,
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
  };
  await adduser(session.id, session);
  // ids of people who sent current logged in user a friend requests
  const incomingSenderIds = (await fetchRedis(
    "smembers",
    "incomingSenderId",
    `user:${session.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis(
        "get",
        "sender",
        `user:${senderId}`
      )) as string;
      const senderParsed = JSON.parse(sender) as Session;

      return {
        senderId,
        senderEmail: senderParsed.email,
      };
    })
  );

  return (
    <main className="pt-8 dark:text-white dark:bg-slate-800 pl-2 shadow-shadow_rght w-full">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.id}
        />
      </div>
    </main>
  );
};

export default page;
