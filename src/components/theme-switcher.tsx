"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const LIGHT = <SunIcon size={20} />,
  DARK = <MoonIcon size={20} />,
  SYSTEM = <MonitorIcon size={20} />;

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      setTheme(theme === "dark" ? "dark" : "light");
    }
  });

  function changeTheme(newTheme: string) {
    let toSet = newTheme as typeof theme;
    if (newTheme === "system") {
      toSet = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      localStorage.removeItem("theme");
    } else localStorage.setItem("theme", newTheme);
    if (toSet === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    setTheme(newTheme as typeof theme);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          title={`Theme: ${theme}`}
          aria-label="Switch theme"
          variant="outline"
          size="icon"
        >
          {theme === "dark" ? DARK : theme === "light" ? LIGHT : SYSTEM}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
          <DropdownMenuRadioItem
            className="flex items-center gap-2"
            value="light"
          >
            {LIGHT}
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="flex items-center gap-2"
            value="dark"
          >
            {DARK}
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="flex items-center gap-2"
            value="system"
          >
            {SYSTEM}
            <span>Follow System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
