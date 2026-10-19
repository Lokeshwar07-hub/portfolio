/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DATA } from "@/data/resume";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion";

function LogoImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border bg-muted flex-none" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border overflow-hidden object-contain flex-none"
      onError={() => setImageError(true)}
    />
  );
}

export default function WorkSection() {
  const [openValue, setOpenValue] = useState("");
  const reduced = Boolean(useReducedMotion());

  return (
    <Accordion
      type="single"
      collapsible
      value={openValue}
      onValueChange={setOpenValue}
      className="w-full grid gap-6"
    >
      {DATA.work.map((work) => {
        const points = work.description
          .split("•")
          .map((point) => point.trim())
          .filter(Boolean);

        const isHeading = (point: string) =>
          /\(#\d+(?:,\s*#\d+)*\)$/.test(point);
        const itemValue = `${work.company}-${work.title}`;
        const isOpen = openValue === itemValue;

        return (
        <AccordionItem
          key={`${work.company}-${work.title}`}
          value={itemValue}
          className="w-full border-b-0 grid gap-2"
        >
          <AccordionTrigger className="hover:no-underline p-0 cursor-pointer transition-colors rounded-none group [&>svg]:hidden">
            <div className="flex items-center gap-x-3 justify-between w-full text-left">
              <div className="flex items-center gap-x-3 flex-1 min-w-0">
                <motion.div
                  animate={{ scale: reduced || !isOpen ? 1 : 1.04 }}
                  transition={reduced ? { duration: 0.01 } : motionTokens.transitions.ui}
                >
                  <LogoImage src={work.logoUrl} alt={work.company} />
                </motion.div>
                <div className="flex-1 min-w-0 gap-0.5 flex flex-col">
                  <div className="font-semibold leading-none flex items-center gap-2">
                    {work.company}
                    <span className="relative inline-flex items-center w-3.5 h-3.5">
                      <motion.span
                        className="absolute inset-0"
                        animate={{
                          opacity: isOpen ? 0 : 1,
                          x: isOpen ? 0 : 2,
                          scale: isOpen ? 0.8 : 1,
                        }}
                        transition={reduced ? { duration: 0.01 } : motionTokens.transitions.ui}
                      >
                        <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2",
                          !isOpen && "group-hover:translate-x-0.5"
                        )}
                      />
                      </motion.span>
                      <motion.span
                        className="absolute inset-0"
                        animate={{
                          opacity: isOpen ? 1 : 0,
                          rotate: isOpen ? 180 : 90,
                          scale: isOpen ? 1 : 0.8,
                        }}
                        transition={reduced ? { duration: 0.01 } : motionTokens.transitions.ui}
                      >
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2" />
                      </motion.span>
                    </span>
                  </div>
                  <div className="font-sans text-sm text-muted-foreground">
                    {work.title}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
                <span>
                  {work.start} - {work.end ?? "Present"}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 ml-13 text-xs sm:text-sm text-muted-foreground">
            <motion.div
              initial={
                reduced
                  ? false
                  : { opacity: 0, y: 8, filter: "blur(6px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={reduced ? { duration: 0.01 } : motionTokens.transitions.gentle}
            >
              {work.href && work.href !== "#" && (
                <a href={work.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium hover:underline mb-2">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 21 3"/></svg>
                  View on GitHub
                </a>
              )}
              <ul className="list-disc pl-4 space-y-1 marker:text-muted-foreground/80">
                {points.map((point, index) =>
                  isHeading(point) ? (
                    <li
                      key={`${work.company}-${index}`}
                      className="leading-relaxed list-none -ml-4 pt-3 first:pt-0 font-semibold text-foreground"
                    >
                      {point}
                    </li>
                  ) : (
                    <li key={`${work.company}-${index}`} className="leading-relaxed">
                      {point}
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        );
      })}
    </Accordion>
  );
}
