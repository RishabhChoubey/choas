"use client";

import { fetchRedis } from "@/helpers/redis";
import { pusherClient } from "@/lib/pusher";
import { cn, toPusherKey } from "@/lib/utils";
import { Message, messageArrayValidator } from "@/lib/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";

async function getChatMessages(chatId: string) {
  try {
    console.log(chatId + "  chatId");
    console.log("inside getting message");
    const results: string[] = await fetchRedis(
      "zrange",
      "result",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    console.log(" having messages");
    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {}
}

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  sessionImg,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  console.log(JSON.stringify(messages) + " messahge");
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      console.log(JSON.stringify(message) + "  p  message");
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  // useEffect(() => {
  //   async function getMessage() {
  //     const message: Message[] = await getChatMessages(chatId);
  //     setMessages((s) => message);
  //   }
  //   getMessage();
  // }, []);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  return (
    <div
      id="messages"
      className="flex h-full w-full shadow-shadow_rght flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch dark:text-white dark:bg-slate-800"
    >
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            className="chat-message "
            key={`${message.id}-${message.timestamp}`}
          >
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn(
                    "px-4 py-2 rounded-lg inline-block shadow-msg_light ",
                    {
                      "bg-indigo-600 text-white": isCurrentUser,
                      "bg-gray-200 text-gray-900": !isCurrentUser,
                      "rounded-br-none":
                        !hasNextMessageFromSameUser && isCurrentUser,
                      "rounded-bl-none":
                        !hasNextMessageFromSameUser && !isCurrentUser,
                    }
                  )}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
