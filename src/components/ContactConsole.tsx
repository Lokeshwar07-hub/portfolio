"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { DATA } from "@/data/resume";

type Unit = { c?: string[]; f: string; link?: boolean };


const UNITS: Unit[] = [
  { c: ["hey", "yo", "hi"], f: "Want" },
  { f: "to" },
  { f: "collaborate" },
  { f: "on" },
  { f: "a" },
  { f: "project," },
  { f: "discuss" },
  { f: "an" },
  { f: "idea," },
  { f: "or" },
  { f: "just" },
  { f: "talk" },
  { f: "tech?" },
  { c: ["Reach", "Connect", "Message"], f: "Reach" },
  { f: "out" },
  { f: "on" },
  { c: ["LinkedIn", "my profile"], f: "LinkedIn", link: true },
  { f: "—" },
  { f: "I'd" },
  { f: "love" },
  { f: "to" },
  { f: "connect!" },
];


const FLICKER_COUNT = 5;
const FLICKER_DELAY = 70;
const STEP_DELAY = 80;
const WORD_DELAY = 65;
const START_DELAY = 700;

export default function ContactConsole() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  const [visible, setVisible] = useState(0);
  const [flickerText, setFlickerText] = useState("");
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [latency, setLatency] = useState(0);
  const [generating, setGenerating] = useState(false);

  const reducedMotion = useRef(false);
  const cancelledRef = useRef(false);
  const linkedinUrl = DATA.contact.social.LinkedIn.url;

  function runGeneration() {
    cancelledRef.current = true;
    setVisible(0);
    setFlickerText("");
    setDone(false);
    setLatency(0);
    setStartTime(performance.now());
    cancelledRef.current = false;

    if (reducedMotion.current) {
      setVisible(UNITS.length);
      setDone(true);
      setGenerating(false);
      setStartTime(null);
      return;
    }

    setGenerating(true);

    let i = 0;

    function step() {
      if (cancelledRef.current) return;
      if (i >= UNITS.length) {
        setDone(true);
        setGenerating(false);
        return;
      }
      const unit = UNITS[i];
      if (unit.c) {
        let flick = 0;
        const interval = setInterval(() => {
          if (cancelledRef.current) {
            clearInterval(interval);
            return;
          }
          setFlickerText(unit.c![flick % unit.c!.length]);
          flick++;
          if (flick > FLICKER_COUNT) {
            clearInterval(interval);
            setFlickerText("");
            i++;
            setVisible(i);
            setTimeout(step, STEP_DELAY);
          }
        }, FLICKER_DELAY);
      } else {
        i++;
        setVisible(i);
        setTimeout(step, WORD_DELAY);
      }
    }

    setTimeout(step, START_DELAY);
  }

  useEffect(() => {
    if (!generating || !startTime) return;
    const id = setInterval(() => {
      setLatency(Math.round(performance.now() - startTime));
    }, 50);
    return () => clearInterval(id);
  }, [generating, startTime]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (!isInView) return;
    runGeneration();
    return () => {
      cancelledRef.current = true;
    };
  }, [isInView]);

  const confidence = Math.min(92, Math.round((visible / UNITS.length) * 92));

  const dotMuted = "bg-muted-foreground/30";
  const dotRed = generating ? "bg-red-500/80" : "bg-red-500/30";
  const dotAmber = generating ? "bg-amber-500/80" : "bg-amber-500/30";
  const dotGreen = !generating && !done
    ? "bg-muted-foreground/30"
    : generating
      ? "bg-emerald-500 animate-pulse"
      : "bg-emerald-500/60";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-y-8 text-center">
      <div className="rounded-xl border bg-primary px-4 py-1 text-sm font-medium text-background">
        Contact
      </div>

      <h2 className="text-3xl font-bold tracking-tighter text-balance sm:text-5xl">
        Get in touch
      </h2>

      <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card/80 text-left font-mono backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className={`h-2 w-2 rounded-full transition-colors duration-300 ${!generating && !done ? dotMuted : dotRed}`} />
              <span className={`h-2 w-2 rounded-full transition-colors duration-300 ${!generating && !done ? dotMuted : dotAmber}`} />
              <span className={`h-2 w-2 rounded-full transition-all duration-300 ${dotGreen}`} />
            </div>
            <span>lokeshwar · contact-v1</span>
            {(generating || done) && startTime && (
              <span className="tabular-nums text-muted-foreground/50">
                · {latency}ms
              </span>
            )}
          </div>
          <div className="tabular-nums text-muted-foreground/70">
            temp <b className="font-semibold text-foreground">0.3</b>
            &nbsp;·&nbsp; top_p{" "}
            <b className="font-semibold text-foreground">0.9</b>
          </div>
        </div>

        <div className="px-5 py-6 text-[15px] leading-relaxed text-foreground">
          <div className="mb-3 text-xs text-muted-foreground">
            <span className="text-foreground">&gt;</span>{" "}
            reach(intent=&quot;let's build something&quot;)
          </div>

          <div className="text-pretty">
            {UNITS.slice(0, visible).map((u, idx) =>
              u.link ? (
                <motion.a
                  key={idx}
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-500 underline decoration-sky-500/40 underline-offset-4 transition-colors duration-300 hover:text-sky-400"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {u.f}{" "}
                </motion.a>
              ) : (
                <motion.span
                  key={idx}
                  className="inline"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {u.f}{" "}
                </motion.span>
              )
            )}
            {flickerText && (
              <span className="text-amber-400/80">{flickerText} </span>
            )}
            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse align-text-bottom bg-primary" />
          </div>
        </div>

        <div className="flex items-center gap-5 border-t border-dashed border-border/60 px-5 pb-5 pt-4 text-[11px] tabular-nums text-muted-foreground/70">
          <div>tokens {visible}</div>
          <div className="flex items-center gap-1.5">
            confidence
            <span className="inline-block h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${confidence}%`,
                  background: "linear-gradient(90deg, #f59e0b, #10b981)",
                  transition: "width 1400ms ease-out",
                }}
              />
            </span>
          </div>
          {done && <div>done</div>}
        </div>

        {done && (
          <div className="flex justify-center pb-4">
            <button
              onClick={runGeneration}
              className="rounded-lg border border-border/60 px-3 py-1 text-[11px] font-mono text-muted-foreground transition-colors duration-200 hover:border-border hover:text-foreground"
            >
              ↻ regenerate
            </button>
          </div>
        )}
      </div>

      <p className="text-balance text-[11.5px] font-mono text-muted-foreground">
        
          I prefer thoughtful messages about projects, collaboration, and
          meaningful opportunities. Please include a little context when reaching out.
        
        <span className="text-foreground/70">auto-dropped</span>, not read.
      </p>
    </div>
  );
}
