/* eslint-disable @next/next/no-img-element */
import BlurFade from "@/components/magicui/blur-fade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import ContactConsole from "@/components/ContactConsole";
import SupportSection from "@/components/section/support-section";
import StatsSection from "@/components/section/stats-section";
import ProjectsSection from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import OpenSourceSection from "@/components/section/open-source-section";
import { allPosts } from "content-collections";
import { CalEmbedInit } from "@/components/cal-embed-init";
import { BlogCard } from "@/components/blog/blog-card";
import { ArrowUpRight, Calendar, FileText } from "lucide-react";
import {
  HeroAvatar,
  HeroHeadline,
  HeroItem,
  HeroMotion,
  Magnetic,
} from "@/components/motion/hero-motion";

export default async function Page() {
  const sortedPosts = [...allPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const latestPosts = sortedPosts.slice(0, 3);

  return (
    <main className="min-h-dvh flex flex-col gap-14 relative w-full">
      <CalEmbedInit />
      <section id="hero" className="bg-glow -mx-4 px-4 rounded-b-[3rem] md:rounded-b-[5rem] pb-12">
        <div className="mx-auto w-full max-w-4xl flex flex-col items-center text-center gap-6 pt-8">
          <HeroMotion className="flex flex-col items-center gap-6">
            <HeroItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
                Open to work
              </span>
            </HeroItem>
            <HeroAvatar>
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border rounded-full shadow-lg ring-2 ring-primary/25 ring-offset-4 ring-offset-background">
                <AvatarImage
                  alt={DATA.name}
                  src={DATA.avatarUrl}
                  className="!aspect-auto h-full w-full object-cover"
                />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </HeroAvatar>
            <div className="flex flex-col gap-3">
              <HeroHeadline
                className="justify-center text-center text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-6xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
                text={DATA.name}
              />
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase max-w-xl mx-auto text-balance">
                {DATA.description}
              </p>
            </div>
            <HeroItem className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <Magnetic>
                <Button
                  data-cal-link="lokeshwar-sikarwar-qke2x0/30min"
                  data-cal-config={JSON.stringify({ layout: "month_view" })}
                  className="gap-2 h-11 rounded-xl text-sm font-medium px-6 w-full sm:w-auto shadow-[0_0_24px_-6px] shadow-primary/40"
                >
                  <Calendar className="size-4" />
                  Schedule a Call
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  variant="outline"
                  asChild
                  className="gap-2 h-11 rounded-xl text-sm font-medium px-6 w-full sm:w-auto"
                >
                  <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4" />
                    Download Resume
                  </a>
                </Button>
              </Magnetic>
            </HeroItem>
            <HeroItem className="flex items-center justify-center gap-2 pt-2">
              {Object.entries(DATA.contact.social)
                .filter(([_, social]) => social.navbar)
                .map(([name, social]) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      title={name}
                      className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-card/50 text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 hover:bg-card hover:-translate-y-0.5"
                    >
                      <IconComponent className="size-4" />
                    </a>
                  );
                })}
            </HeroItem>
          </HeroMotion>
        </div>
      </section>
      <section id="about">
        <div className="flex min-h-0 flex-col gap-y-4">
          <BlurFade inView>
            <h2 className="text-xl font-bold tracking-tight">About</h2>
          </BlurFade>
          <BlurFade inView delay={0.08}>
            <div className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
              <Markdown>
                {DATA.summary}
              </Markdown>
            </div>
          </BlurFade>
        </div>
      </section>
      {/* <section id="open-source" className="pt-4">
        <BlurFade inView>
          <OpenSourceSection />
        </BlurFade>
      </section> */}
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-6">
          <BlurFade inView>
            <h2 className="text-xl font-bold tracking-tight">Work Experience</h2>
          </BlurFade>
          <BlurFade inView delay={0.08}>
            <WorkSection />
          </BlurFade>
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-6">
          <BlurFade inView>
            <h2 className="text-xl font-bold tracking-tight">Education</h2>
          </BlurFade>
          <div className="flex flex-col gap-8">
            {DATA.education.map((education, index) => (
              <BlurFade
                key={education.school}
                inView
                delay={index * 0.05}
              >
                <div className="flex items-center gap-x-3 justify-between group">
                  <div className="flex items-center gap-x-3 flex-1 min-w-0">
                    {education.logoUrl ? (
                      <img
                        src={education.logoUrl}
                        alt={education.school}
                        className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border overflow-hidden object-contain flex-none"
                      />
                    ) : (
                      <div className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border bg-muted flex-none" />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="font-semibold leading-none">
                        {education.school}
                      </div>
                      <div className="font-sans text-sm text-muted-foreground">
                        {education.degree}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
                    <span>
                      {education.start} - {education.end}
                    </span>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-4">
          <BlurFade inView>
            <h2 className="text-xl font-bold tracking-tight">Skills</h2>
          </BlurFade>
          <BlurFade inView delay={0.08}>
            <div className="flex flex-wrap gap-2">
              {DATA.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="group flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 h-9 px-3 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  {skill.icon && (
                    <skill.icon
                      className="size-4 rounded overflow-hidden object-contain transition-transform group-hover:scale-110"
                      style={skill.color ? { color: skill.color, fill: skill.color } : undefined}
                    />
                  )}
                  <span className="text-foreground text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>
      <section id="projects">
        <BlurFade inView>
          <ProjectsSection />
        </BlurFade>
      </section>
      <StatsSection />
      <section id="support">
        <BlurFade inView>
          <SupportSection />
        </BlurFade>
      </section>
      <section id="contact">
        <BlurFade inView>
          <ContactConsole />
        </BlurFade>
      </section>


      <footer className="mt-6 border-t border-border/60 pt-10 pb-24 md:pb-10">
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-2xl font-semibold tracking-tighter bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent select-none">
            {DATA.name.toUpperCase()}
          </p>
          <div className="flex items-center gap-2">
            {Object.entries(DATA.contact.social)
              .filter(([_, social]) => social.navbar)
              .map(([name, social]) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={`footer-${name}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:text-primary"
                  >
                    <IconComponent className="size-4" />
                  </a>
                );
              })}
          </div>
          <p className="text-sm text-muted-foreground/60">
            &copy; {new Date().getFullYear()} {DATA.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
