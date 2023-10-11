import AddFriendButton from "@/components/AddFriendButton";
import { FC } from "react";

const page: FC = () => {
  return (
    <main className="pt-8 dark:text-white dark:bg-slate-800 pl-2 shadow-shadow_rght w-full">
      <h1 className="font-bold text-5xl mb-8 dark:text-white">Add a friend</h1>
      <AddFriendButton />
    </main>
  );
};

export default page;
