import Providers from "@/components/Providers";
import "./globals.css";
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  useSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { dark } from "@clerk/themes";
import { currentUser } from "@clerk/nextjs";

// Done after the video and optional: add page metadata
export const metadata = {
  title: "Choas | Home",
  description: "Welcome to the Choas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      {/* <ClerkLoading>
        <div>Clerk is loading</div>
      </ClerkLoading> */}

      <html lang="en">
        <body className="">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
