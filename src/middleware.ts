import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // afterAuth(auth, req, evt) {
  //   // handle users who aren't authenticated
  //   if (
  //     (!auth.userId && req.nextUrl.pathname.search("/sign-in") < 0) ||
  //     req.nextUrl.pathname.search("/sign-up") < 0
  //   ) {
  //     return redirectToSignIn({ returnBackUrl: req.url });
  //   }
  //   // redirect them to organization selection page
  //   if (auth.userId && req.nextUrl.pathname.search("/dashboard") < 0) {
  //     console.log(" here redirect");
  //     const orgSelection = new URL("/dashboard", req.url);
  //     return NextResponse.redirect(orgSelection);
  //   }
  // },
});
