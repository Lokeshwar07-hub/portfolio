import Link from "next/link";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportSection() {
  return (
    <div className="border rounded-xl p-10 relative">
      <div className="flex flex-col items-center justify-center gap-5 text-center py-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Support My Journey
        </h2>

        <p className="mx-auto max-w-2xl text-muted-foreground text-balance leading-relaxed text-sm sm:text-base">
          I&apos;m building projects, learning new technologies, and sharing what I
          learn along the way. Your support helps me keep creating, experimenting,
          and turning ideas into real projects.
        </p>
        <Button
          asChild
          className="gap-2 h-11 rounded-xl text-sm font-medium px-6 pt-2"
        >
          <Link
            href="https://buymeacoffee.com/lokeshwarr07"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Coffee className="size-4" />
            Support My Work
          </Link>
        </Button>
      </div>
    </div>
  );
}
