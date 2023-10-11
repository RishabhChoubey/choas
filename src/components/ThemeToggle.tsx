"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Icon } from "@/components/Icon";
import Button from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export default function ThemeToggle() {
  const { setTheme } = useTheme();
  const { theme } = useTheme();

  React.useEffect(() => {}, [theme]);
  return (
    <div className=" flex  border-black border-solid rounded-full w-6 h-6  bg-black dark:bg-white items-center justify-center border-1">
      {theme === "dark" ? (
        <div
          onClick={() => setTheme("light")}
          className="flex h-4 w-4 items-center justify-center"
        >
          <Icon.Sun className=" h-4 w-4 stroke-amber-700" />
        </div>
      ) : (
        <div
          onClick={() => setTheme("dark")}
          className="flex h-4 w-4 items-center justify-center"
        >
          <Icon.Moon className=" h-4 w-4 stroke-amber-700" />
        </div>
      )}
    </div>
  );
}
