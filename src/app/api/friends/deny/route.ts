import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Session } from "@/types/typings";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

    await db.srem(`user:${session.id}:incoming_friend_requests`, idToDeny);

    return new Response("OK");
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
