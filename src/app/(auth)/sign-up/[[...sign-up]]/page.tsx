import { RedirectToSignIn, SignUp } from "@clerk/nextjs";

import { RedirectToSignUp, SignIn } from "@clerk/nextjs";
import Button from "@/components/ui/Button";
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  useSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <div className="flex w-full absolute h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="w-full flex flex-col items-space items-center justify-center  max-w-md space-y-10 ">
          <div className="flex flex-col items-center gap-8">
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sign up to your account
            </h2>
          </div>

          <SignedOut>
            <SignUp
              routing="path"
              afterSignUpUrl="/dashboard"
              redirectUrl="/dashboard"
            />
          </SignedOut>
        </div>
      </div>
    </>
  );
}
