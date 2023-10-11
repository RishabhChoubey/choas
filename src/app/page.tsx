import Image from "next/image";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import { AuthenticateWithRedirectCallback, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { User } from "@clerk/nextjs/api";
export default async function Home() {
  const user: User | null = await currentUser();
  console.log(user + "  ///////////////////////////////////");
  if (user != null) redirect("/dashboard");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>helloo</div>
    </main>
  );
}
