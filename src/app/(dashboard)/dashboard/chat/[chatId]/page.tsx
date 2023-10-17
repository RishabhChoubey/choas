import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { Session } from "@/types/typings";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";
import { revalidateTag } from "next/cache";

export async function generateMetadata({
  params,
}: {
  params: { chatId: string };
}) {
  const user: User | null = await currentUser();
  if (user == null) notFound();
  console.log(user + "  ///////////////////////////////////");
  const session: Session = {
    id: user.id,
    name: user.firstName,
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
  };
  const [userId1, userId2] = params.chatId.split("--");

  const chatPartnerId = session.id === userId1 ? userId2 : userId1;
  const chatPartnerRaw = (await fetchRedis(
    "get",
    "chatPaternerRaw",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as Session;
  if (!chatPartnerRaw) notFound();

  return { title: `Choas | ${chatPartner.name} chat` };
}

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    console.log("inside getting message");
    const results: string[] = await fetchRedis(
      "zrange",
      "chatMessage",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    console.log(" having messages");
    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const user: User | null = await currentUser();
  if (user == null) notFound();
  console.log("  in pAge parter  " + user.emailAddresses[0].emailAddress);
  const session: Session = {
    id: user.id,
    name: user.firstName,
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
  };

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  // new

  const chatPartnerRaw = (await fetchRedis(
    "get",
    "chatRawPartner",
    `user:${chatPartnerId}`
  )) as string;
  console.log("chat rasw    " + chatPartnerRaw);
  const chatPartner = JSON.parse(chatPartnerRaw) as Session;
  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 shadow-shadow_rght w-full justify-between flex flex-col h-full max-h-[calc(100vh)] md:max-h-[calc(100vh)] dark:text-white dark:bg-slate-800">
      <div className="flex shadow-shadow_rght sm:items-center justify-between py-3 border-b-2 border-gray-200 dark:text-white dark:bg-slate-800">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12 ml-1">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold dark:text-white dark:bg-slate-800">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600 dark:text-white dark:bg-slate-800">
              {chatPartner.email}
            </span>
          </div>
        </div>
      </div>

      <Messages
        chatId={chatId}
        chatPartner={chatPartner}
        sessionImg={session.image}
        sessionId={session.id}
        initialMessages={initialMessages}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  );
};

export default page;
