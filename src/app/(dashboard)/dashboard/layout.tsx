import { Icon, Icons } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {
  ClerkLoading,
  UserButton,
  currentUser,
  ClerkLoaded,
} from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";
import FriendRequestSidebarOptions from "@/components/FriendRequestSidebarOptions";
import { fetchRedis } from "@/helpers/redis";
import { adduser, getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/SidebarChatList";
import MobileChatLayout from "@/components/MobileChatLayout";
import { Session, SidebarOption } from "@/types/typings";
//import { ThemeToggle } from "@/components/ThemeToggle";
import { db } from "@/lib/db";
import dynamic from "next/dynamic";
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

interface LayoutProps {
  children: ReactNode;
}

// Done after the video and optional: add page metadata
export const metadata = {
  title: "Choas | Dashboard",
  description: "Your dashboard",
};

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const Layout = async ({ children }: LayoutProps) => {
  // const session = await getServerSession(authOptions);
  // console.log(session + "  session");
  // if (!session) notFound();
  // console.log(session.image);
  const user: User | null = await currentUser();
  if (user == null) notFound();
  console.log(user + "  ///////////////////////////////////here");
  const session: Session = {
    id: user.id,
    name: user.firstName,
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
  };

  adduser(session.id, session);
  const friends = await getFriendsByUserId(user.id);

  console.log("friends", friends);

  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `user:${user.id}:incoming_friend_requests`
    )) as Session[]
  ).length;

  return (
    <div className="w-screen flex h-screen  dark:bg-slate-800 p-1">
      <div className="md:hidden">
        <MobileChatLayout
          friends={friends}
          session={session}
          sidebarOptions={sidebarOptions}
          unseenRequestCount={unseenRequestCount}
        />
      </div>

      <div className="hidden md:flex h-full w-full  grow max-w-[22rem] flex-col gap-y-5 overflow-y-auto border-gray-200 bg-white px-6 dark:bg-slate-800 dark:text-white shadow-shadow_rght">
        <div className="flex justify-between items-center ">
          <Link
            href="/dashboard"
            className="flex h-16 shrink-0 items-center justify-center"
          >
            <Icons.Logo className="h-8 w-auto text-indigo-600" />
          </Link>

          <ThemeToggle />
        </div>

        {friends.length > 0 ? (
          <div className="text-xs font-semibold leading-6 text-gray-400">
            Your chats
          </div>
        ) : null}
        <nav className="flex flex-1 flex-col ">
          <ul
            role="list"
            className="flex flex-1 flex-col gap-y-7 dark:text-white"
          >
            <li>
              <SidebarChatList sessionId={session.id} friends={friends} />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-white">
                Overview
              </div>

              <ul role="list" className="-mx-2 mt-2 space-y-1 ">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold dark:text-white dark:hover:text-slate-900"
                      >
                        <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white dark:text-black">
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="truncate dark:text-white dark:group-hover:text-slate-900 ">
                          {option.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}

                <li>
                  <FriendRequestSidebarOptions
                    sessionId={session.id}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <span className="sr-only dark:text-white">Your profile</span>
                <div className="flex flex-col dark:text-white text-sm">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      <aside className="max-h-screen min-h-full pt-12 md:pt-0  w-full  flex justify-center md:justify-start">
        {children}
      </aside>
    </div>
  );
};

export default Layout;
