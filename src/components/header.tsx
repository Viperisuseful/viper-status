import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          aria-label="Viper Status home"
        >
          <Image src="/viper-mark.svg" alt="" width={30} height={30} priority />
          <span className="text-lg font-semibold tracking-[-0.025em]">
            Viper Status
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="https://viperisuseful.cc"
            className="hidden min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:flex"
          >
            viperisuseful.cc
            <ExternalLink data-icon="inline-end" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
