// import { AuthenticateWithRedirectCallback, currentUser } from "@clerk/nextjs";
// import { notFound } from "next/navigation";
// import type { User } from "@clerk/nextjs/api";
// import { Session } from "@/types/typings";
// import { adduser } from "@/helpers/get-friends-by-user-id";
// export default async function SSOCallBack() {
//   const user: User | null = await currentUser();
//   console.log(user + "  ///////////////////////////////////");
//   if (user == null) notFound();

//   const session: Session = {
//     id: user.id,
//     name: user.firstName,
//     email: user.emailAddresses[0].emailAddress,
//     image: user.imageUrl,
//   };
//   console.log("here in call back /////////////////////");
//   adduser(session.id, session);
//   return <AuthenticateWithRedirectCallback />;
// }
