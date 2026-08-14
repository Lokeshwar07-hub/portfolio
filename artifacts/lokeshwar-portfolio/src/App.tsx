import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDot,
  Code2,
  ExternalLink,
  FileText,
  Github,
  GitBranch,
  Linkedin,
  Mail,
  Menu,
  NotebookTabs,
  Send,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  getGetGithubActivityQueryKey,
  getGetGithubContributionsQueryKey,
  getGetGithubReposQueryKey,
  getGetLeetcodeProfileQueryKey,
  getGetLeetcodeRecentQueryKey,
  useGetGithubActivity,
  useGetGithubContributions,
  useGetGithubRepos,
  useGetLeetcodeProfile,
  useGetLeetcodeRecent,
} from '@workspace/api-client-react';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const githubRepos = useGetGithubRepos({ query: { queryKey: getGetGithubReposQueryKey(), retry: false } });
  const githubActivity = useGetGithubActivity({ query: { queryKey: getGetGithubActivityQueryKey(), retry: false } });
  const githubContributions = useGetGithubContributions({ query: { queryKey: getGetGithubContributionsQueryKey(), retry: false } });
  const leetcodeProfile = useGetLeetcodeProfile({ query: { queryKey: getGetLeetcodeProfileQueryKey(), retry: false } });
  const leetcodeRecent = useGetLeetcodeRecent({ query: { queryKey: getGetLeetcodeRecentQueryKey(), retry: false } });

  const navItems = useMemo(() => [
    ['about', 'About'],
    ['work', 'Work'],
    ['github', 'GitHub'],
    ['dsa', 'DSA'],
    ['journey', 'Journey'],
    ['contact', 'Contact'],
  ], []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.35, 0.7] });
    navItems.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [navItems]);

  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.55 } };
  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const message = String(form.get('message') || '').trim();
    if (!name || !email || !message || !email.includes('@')) {
      setFormError('Please add your name, a valid email, and a message.');
      setSent(false);
      return;
    }
    setFormError('');
    setSent(true);
    window.location.href = `${profile.email}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(`${message}\n\nReply to: ${email}`)}`;
  };

  return (
    <div className="noise min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <div className="portfolio-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border/80 bg-background/75 px-4 py-3 shadow-[0_14px_40px_hsl(220_30%_3%_/_0.24)] backdrop-blur-xl" aria-label="Primary navigation">
          <a href="#home" className="focus-ring flex items-center gap-2 rounded-full" data-testid="link-home">
            <span className="grid size-8 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">LS</span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">Lokeshwar Sikarwar</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} data-testid={`link-nav-${id}`} className={`focus-ring rounded-full px-3 py-2 text-xs transition-colors ${activeSection === id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href={profile.resume} target="_blank" rel="noreferrer" data-testid="link-nav-resume" className="focus-ring hidden items-center gap-1.5 rounded-full border border-primary/50 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:flex">
              <FileText className="size-3.5" /> Resume
            </a>
            <button type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu" className="focus-ring rounded-full p-2 text-muted-foreground hover:text-foreground md:hidden">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-xl md:hidden">
            {navItems.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-nav-${id}`} className="focus-ring flex rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">{label}</a>)}
            <a href={profile.resume} target="_blank" rel="noreferrer" data-testid="link-mobile-resume" className="focus-ring mt-1 flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"><FileText className="size-4" /> Open resume</a>
          </motion.div>
        )}
      </header>

      <main className="relative z-10">
        <section id="home" className="mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:pt-28">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="max-w-3xl">
            <div className="mb-7 flex flex-wrap items-center gap-3 text-[10px] font-code uppercase tracking-[.18em] text-primary">
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-accent shadow-[0_0_0_5px_hsl(var(--accent)/.1)]" /> Open to internships &amp; opportunities</span>
              <span className="text-muted-foreground">·</span>
              <span>Software engineer / full-stack</span>
            </div>
            <h1 className="font-display text-[clamp(3.5rem,9vw,7.7rem)] font-semibold leading-[.91] tracking-[-.07em] text-balance">
              Building things<br /><span className="text-primary">for the web,</span><br />one problem at a time.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">I&apos;m Lokeshwar — a Computer Science student focused on building clean, useful and scalable web applications while sharpening my problem-solving skills.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#work" data-testid="link-hero-work" className="focus-ring group flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">View my work <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a>
              <SocialLink href={profile.github} label="GitHub" icon={<Github className="size-4" />} testId="link-hero-github" />
              <SocialLink href={profile.leetcode} label="LeetCode" icon={<Code2 className="size-4" />} testId="link-hero-leetcode" />
              <a href={profile.resume} target="_blank" rel="noreferrer" data-testid="link-hero-resume" className="focus-ring flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"><FileText className="size-4" /> Resume</a>
            </div>
            <div className="mt-16 hidden items-center gap-3 text-xs text-muted-foreground sm:flex"><ArrowDownRight className="size-4 text-primary" /> Scroll to explore</div>
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .12 }} className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-10 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-border px-2 pb-4">
                <div className="flex items-center gap-2"><Terminal className="size-4 text-primary" /><span className="font-code text-xs text-muted-foreground">lokeshwar@portfolio:~</span></div>
                <span className="font-code text-[10px] text-muted-foreground">01 / 04</span>
              </div>
              <div className="space-y-4 px-2 py-7 font-code text-xs leading-6">
                <p><span className="text-accent">const</span> <span className="text-primary">focus</span> = <span className="text-foreground">&quot;build useful things&quot;</span>;</p>
                <p><span className="text-accent">while</span> (learning) {'{'}<br /><span className="pl-5 text-muted-foreground">solve(); ship(); improve();</span><br />{'}'}</p>
                <div className="mt-8 grid grid-cols-2 gap-2 font-sans">
                  <TerminalStat label="focus" value="full-stack" />
                  <TerminalStat label="mindset" value="problem solver" />
                  <TerminalStat label="education" value="B.Tech · year 3" />
                  <TerminalStat label="chapter" value="2024 — now" />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-[11px] text-muted-foreground"><span className="size-1.5 rounded-full bg-accent" /> currently learning DSA & system design fundamentals</div>
            </div>
          </motion.div>
        </section>

        <SectionDivider />
        <motion.section id="about" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
          <SectionKicker number="01" label="A little context" />
          <div className="mt-8 grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <h2 className="font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">More than a<br /><span className="text-primary">title.</span></h2>
            <div>
              <div className="space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
                <p>I&apos;m a 3rd-year Computer Science student specializing in Data Science, but my main career focus is software engineering and full-stack web development.</p>
                <p>I enjoy turning ideas into working products and understanding how applications work from frontend to backend. I work primarily with React, JavaScript, Node.js, Express and MongoDB, while continuously improving my problem-solving skills through Data Structures &amp; Algorithms.</p>
                <p>Alongside development, I&apos;m the General Secretary of IEEE Robotics &amp; Automation Society, where I contribute to technical activities, teamwork and student initiatives.</p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['3rd-year B.Tech', 'Full-stack development', 'React + Node.js', 'Java + DSA'].map((item, index) => <div key={item} data-testid={`text-about-fact-${index}`} className="border-l border-primary/50 pl-3 text-xs leading-5 text-foreground">{item}</div>)}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="skills" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:px-8 lg:px-10">
          <SectionKicker number="02" label="The toolkit" />
          <div className="mt-8 grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div><h2 className="font-display text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Things I<br /><span className="text-accent">work with.</span></h2><p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">A practical stack for moving from an idea to a working application.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Frontend', ['HTML', 'CSS', 'JavaScript', 'React']],
                ['Backend', ['Node.js', 'Express', 'MongoDB', 'REST APIs']],
                ['Programming', ['Java', 'Python', 'SQL', 'DSA']],
                ['Tools & practices', ['Git / GitHub', 'CRUD', 'Authentication', 'Responsive design']],
              ].map(([label, items]) => <div key={String(label)} className="rounded-2xl border border-border bg-card/65 p-5"><div className="mb-4 font-code text-[10px] uppercase tracking-[.18em] text-primary">{label}</div><div className="flex flex-wrap gap-2">{(items as string[]).map((item) => <span key={item} data-testid={`tag-skill-${item.toLowerCase().replaceAll(' ', '-')}`} className="rounded-lg border border-border bg-secondary/70 px-3 py-2 text-xs text-foreground transition-colors hover:border-primary/60 hover:text-primary">{item}</span>)}</div></div>)}
            </div>
          </div>
        </motion.section>

        <motion.section id="work" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><SectionKicker number="03" label="Selected work" /><h2 className="mt-7 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Things I&apos;ve<br /><span className="text-primary">built.</span></h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">A small, honest selection of projects. More will live here as they become real.</p></div>
          <div className="mt-12 space-y-6">
            {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
          </div>
        </motion.section>

        <motion.section id="github" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><SectionKicker number="04" label="Open source" /><h2 className="mt-7 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Where I build,<br /><span className="text-accent">experiment &amp; ship.</span></h2></div><SocialLink href={profile.github} label="View GitHub profile" icon={<ArrowUpRight className="size-4" />} testId="link-github-profile" /></div>
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-3xl border border-border bg-card/65 p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><Github className="size-5" /></span><div><div className="font-semibold">{profile.githubUsername}</div><div className="font-code text-[10px] text-muted-foreground">public repositories</div></div></div><GitBranch className="size-4 text-primary" /></div>
              {githubRepos.isLoading ? <RepositorySkeleton /> : githubRepos.isError ? <Unavailable href={profile.github} label="View my GitHub activity" /> : githubRepos.data?.length ? <div className="space-y-2">{githubRepos.data.slice(0, 5).map((repo) => <a key={repo.id} href={repo.htmlUrl} target="_blank" rel="noreferrer" data-testid={`card-repository-${repo.id}`} className="focus-ring group flex items-center justify-between rounded-xl border border-transparent bg-secondary/60 px-4 py-3 transition-colors hover:border-primary/40"><div className="min-w-0"><div className="truncate text-sm font-semibold">{repo.name}</div><div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground"><span>{repo.language || 'Repository'}</span><span>Stars {repo.stars}</span><span>Forks {repo.forks}</span></div></div><ArrowUpRight className="ml-3 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></a>)}</div> : <Unavailable href={profile.github} label="View my GitHub activity" />}
            </div>
            <div className="rounded-3xl border border-border bg-card/65 p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><div className="font-semibold">Contribution rhythm</div><div className="mt-1 font-code text-[10px] text-muted-foreground">live public activity</div></div><span data-testid="status-github-contributions" className="font-code text-xs text-primary">{githubContributions.data ? `${githubContributions.data.total} total` : 'awaiting data'}</span></div>{githubContributions.isLoading ? <div className="grid grid-cols-12 gap-1.5">{Array.from({ length: 84 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-sm" />)}</div> : githubContributions.isError || !githubContributions.data?.days?.length ? <Unavailable href={profile.github} label="View my GitHub activity" /> : <ContributionGrid days={githubContributions.data.days} />}</div>
          </div>
          {githubActivity.data?.length ? <div className="mt-5 rounded-3xl border border-border bg-card/65 p-5 sm:p-7"><div className="mb-5 flex items-center gap-2 font-semibold"><CircleDot className="size-4 text-primary" /> Recent activity</div><div className="grid gap-3 md:grid-cols-2">{githubActivity.data.slice(0, 4).map((activity) => <a key={activity.id} href={activity.repoUrl} target="_blank" rel="noreferrer" data-testid={`card-activity-${activity.id}`} className="focus-ring rounded-xl border border-border/70 p-4 hover:border-primary/40"><div className="font-code text-[10px] uppercase tracking-wider text-primary">{activity.type}</div><div className="mt-2 text-sm font-semibold">{activity.summary}</div><div className="mt-1 text-xs text-muted-foreground">{activity.repoName}</div></a>)}</div></div> : githubActivity.isLoading ? <div className="mt-5 h-24 rounded-3xl border border-border skeleton" aria-label="Loading GitHub activity" /> : null}
        </motion.section>

        <motion.section id="dsa" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><SectionKicker number="05" label="Problem solving" /><h2 className="mt-7 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Build the thing.<br /><span className="text-primary">Solve the hard part.</span></h2></div><p className="max-w-sm text-sm leading-6 text-muted-foreground">Building projects is one side of engineering. Solving problems is the other.</p></div>
          <div className="mt-12 rounded-3xl border border-border bg-card/65 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f4a11a]/15 text-[#f4a11a]"><Code2 className="size-5" /></span><div><div className="font-semibold">LeetCode / {leetcodeProfile.data?.username || profile.leetcodeUsername}</div><div className="font-code text-[10px] text-muted-foreground">active practice</div></div></div><SocialLink href={profile.leetcode} label="View LeetCode profile" icon={<ArrowUpRight className="size-4" />} testId="link-leetcode-profile" /></div>
            {leetcodeProfile.isLoading ? <div className="mt-7 grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div> : leetcodeProfile.isError || !leetcodeProfile.data ? <div className="mt-7"><Unavailable href={profile.leetcode} label="View my latest LeetCode progress" /></div> : <div className="mt-7 grid gap-3 sm:grid-cols-4">{[['Solved', leetcodeProfile.data.totalSolved], ['Easy', leetcodeProfile.data.easySolved], ['Medium', leetcodeProfile.data.mediumSolved], ['Hard', leetcodeProfile.data.hardSolved]].filter(([, value]) => value !== null && value !== undefined).map(([label, value]) => <div key={label} data-testid={`stat-leetcode-${String(label).toLowerCase()}`} className="rounded-2xl border border-border bg-secondary/65 p-4"><div className="font-code text-[10px] uppercase tracking-[.15em] text-muted-foreground">{label}</div><div className="mt-2 font-display text-3xl font-semibold">{value}</div></div>)}</div>}
            <div className="mt-9 flex flex-wrap gap-2">{['Arrays', 'Binary search', 'Linked lists', 'Stacks', 'Queues', 'Trees', 'Sorting', 'Recursion'].map((item) => <span key={item} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">{item}</span>)}</div>
            {leetcodeRecent.isLoading ? <div className="mt-9 h-28 rounded-2xl skeleton" aria-label="Loading LeetCode problems" /> : leetcodeRecent.data?.length ? <div className="mt-9"><div className="mb-4 font-code text-[10px] uppercase tracking-[.18em] text-primary">Recent problems</div><div className="grid gap-2 md:grid-cols-2">{leetcodeRecent.data.slice(0, 6).map((problem) => <a key={problem.id} href={problem.url} target="_blank" rel="noreferrer" data-testid={`card-leetcode-problem-${problem.id}`} className="focus-ring flex items-center justify-between rounded-xl border border-border/70 p-4 hover:border-primary/40"><div className="min-w-0"><div className="truncate text-sm font-semibold">{problem.number ? `${problem.number}. ` : ''}{problem.title}</div><div className="mt-1 text-xs text-muted-foreground">{problem.difficulty || 'Problem'} {problem.topics?.length ? `· ${problem.topics.slice(0, 2).join(' · ')}` : ''}</div></div><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></a>)}</div></div> : leetcodeRecent.isError ? <div className="mt-8"><Unavailable href={profile.leetcode} label="View my latest LeetCode progress" /></div> : null}
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:px-10">
          <SectionKicker number="06" label="The loop" />
          <h2 className="mt-7 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Code. Build. Solve.</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-3">{[['BUILD', 'I build real-world web applications.', <BriefcaseBusiness key="build" />], ['SOLVE', 'I practice Data Structures & Algorithms.', <NotebookTabs key="solve" />], ['LEARN', 'I continuously improve my software engineering skills.', <BookOpen key="learn" />]].map(([label, copy, icon], index) => <div key={String(label)} data-testid={`card-loop-${String(label).toLowerCase()}`} className={`rounded-3xl border p-6 sm:p-8 ${index === 1 ? 'border-primary/50 bg-primary text-primary-foreground' : 'border-border bg-card/65'}`}><div className="flex items-center justify-between"><span className="font-code text-xs tracking-[.2em]">{label}</span><span>{icon}</span></div><p className="mt-16 max-w-[17rem] font-display text-2xl font-semibold leading-tight">{copy}</p></div>)}</div>
        </motion.section>

        <motion.section id="journey" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><SectionKicker number="07" label="The journey" /><h2 className="mt-7 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Still early.<br /><span className="text-accent">Already moving.</span></h2></div><div className="relative border-l border-border pl-7 sm:pl-10"><div className="absolute -left-1.5 top-1.5 size-3 rounded-full bg-primary ring-8 ring-background" /><div className="font-code text-[10px] uppercase tracking-[.2em] text-primary">2024 — present</div><h3 className="mt-4 text-xl font-semibold">B.Tech Computer Science</h3><p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">Currently pursuing B.Tech in Computer Science with a specialization in Data Science.</p><div className="mt-14"><div className="absolute -left-1.5 size-3 rounded-full bg-accent ring-8 ring-background" /><div className="font-code text-[10px] uppercase tracking-[.2em] text-accent">Leadership</div><h3 className="mt-4 text-xl font-semibold">General Secretary</h3><p className="mt-1 text-sm text-foreground">IEEE Robotics &amp; Automation Society</p><p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">Leading and contributing to technical activities, student initiatives, teamwork and organizational responsibilities within IEEE RAS.</p></div></div></div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:px-10">
          <div className="rounded-[2rem] border border-border bg-card/65 p-7 sm:p-10"><div className="flex flex-wrap items-end justify-between gap-6"><div><SectionKicker number="08" label="On the desk" /><h2 className="mt-7 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Currently<br /><span className="text-primary">learning.</span></h2></div><Sparkles className="size-8 text-primary" /></div><div className="mt-10 flex flex-wrap gap-2">{['Data Structures & Algorithms', 'Backend development', 'Software engineering', 'React', 'Node.js', 'System design fundamentals'].map((item, index) => <span key={item} data-testid={`tag-learning-${index}`} className={`rounded-full border px-4 py-2.5 text-sm ${index === 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>{item}</span>)}</div></div>
        </motion.section>

        <motion.section id="contact" {...reveal} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><SectionKicker number="09" label="Get in touch" /><h2 className="mt-7 font-display text-5xl font-semibold tracking-[-.06em] sm:text-7xl">Let&apos;s build<br /><span className="text-primary">something.</span></h2><p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">Have an opportunity, project idea, or just want to talk tech? Feel free to reach out.</p><div className="mt-8 flex flex-wrap gap-2"><SocialLink href={profile.email} label="Email me" icon={<Mail className="size-4" />} testId="link-contact-email" /><SocialLink href={profile.linkedin} label="LinkedIn" icon={<Linkedin className="size-4" />} testId="link-contact-linkedin" /></div></div><form onSubmit={handleContact} className="rounded-3xl border border-border bg-card/65 p-5 sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-xs text-muted-foreground">Name<input name="name" required aria-label="Your name" data-testid="input-contact-name" className="focus-ring rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Your name" /></label><label className="grid gap-2 text-xs text-muted-foreground">Email<input name="email" type="email" required aria-label="Your email" data-testid="input-contact-email" className="focus-ring rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" placeholder="you@example.com" /></label></div><label className="mt-5 grid gap-2 text-xs text-muted-foreground">Message<textarea name="message" required aria-label="Your message" data-testid="input-contact-message" className="focus-ring min-h-36 resize-y rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Tell me a little about it..." /></label>{formError && <p role="alert" data-testid="status-contact-error" className="mt-4 text-xs text-destructive">{formError}</p>}{sent && <p role="status" data-testid="status-contact-sent" className="mt-4 flex items-center gap-2 text-xs text-accent"><Check className="size-4" /> Your email draft is ready.</p>}<button type="submit" data-testid="button-contact-submit" className="focus-ring mt-6 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">Send message <Send className="size-4" /></button></form></div>
        </motion.section>
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl border-t border-border px-5 py-10 sm:px-8 lg:px-10"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><div className="font-display text-lg font-semibold">{profile.name}</div><p className="mt-1 text-xs text-muted-foreground">Built with React &amp; curiosity.</p></div><div className="flex flex-wrap gap-4 text-xs text-muted-foreground">{[[profile.github, 'GitHub'], [profile.linkedin, 'LinkedIn'], [profile.leetcode, 'LeetCode'], [profile.email, 'Email'], [profile.resume, 'Resume']].map(([href, label]) => <a key={label} href={href} target={label === 'Email' ? undefined : '_blank'} rel={label === 'Email' ? undefined : 'noreferrer'} data-testid={`link-footer-${String(label).toLowerCase()}`} className="focus-ring rounded hover:text-primary">{label}</a>)}</div></div><div className="mt-8 flex items-center justify-between font-code text-[10px] text-muted-foreground"><span>© 2026 Lokeshwar Sikarwar</span><span>09 / 09</span></div></footer>
    </div>
  );
}

function SocialLink({ href, label, icon, testId }: { href: string; label: string; icon: ReactNode; testId: string }) {
  return <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel={href.startsWith('mailto:') ? undefined : 'noreferrer'} aria-label={label} data-testid={testId} className="focus-ring flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">{icon}{label}</a>;
}

function SectionKicker({ number, label }: { number: string; label: string }) {
  return <div className="flex items-center gap-3 font-code text-[10px] uppercase tracking-[.2em] text-muted-foreground"><span className="text-primary">{number}</span><span className="h-px w-8 bg-border" />{label}</div>;
}

function SectionDivider() {
  return <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10"><div className="h-px bg-border" /></div>;
}

function TerminalStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-secondary/60 p-3"><div className="font-code text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 text-xs text-foreground">{value}</div></div>;
}

function Unavailable({ href, label }: { href: string; label: string }) {
  return <div data-testid="status-live-unavailable" className="rounded-2xl border border-dashed border-border p-6"><p className="text-sm text-muted-foreground">Live activity is temporarily unavailable.</p><a href={href} target="_blank" rel="noreferrer" data-testid="link-live-fallback" className="focus-ring mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">{label} <ArrowUpRight className="size-3.5" /></a></div>;
}

function RepositorySkeleton() {
  return <div className="space-y-2" aria-label="Loading GitHub repositories">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>;
}

function ContributionGrid({ days }: { days: Array<{ date: string; count: number; level: number }> }) {
  const colors = ['bg-secondary', 'bg-accent/30', 'bg-accent/55', 'bg-accent/75', 'bg-primary'];
  return <div data-testid="grid-github-contributions" className="grid max-h-44 grid-flow-col grid-rows-7 gap-1 overflow-hidden">{days.slice(-126).map((day) => <div key={day.date} title={`${day.date}: ${day.count} contributions`} className={`aspect-square rounded-[3px] ${colors[Math.min(day.level, 4)] || colors[0]}`} />)}</div>;
}

function ProjectCard({ project, index }: { project: typeof projects[number]; index: number }) {
  return <article data-testid={`card-project-${project.id}`} className={`group grid overflow-hidden rounded-[2rem] border border-border bg-card/65 transition-transform duration-300 hover:-translate-y-1 lg:grid-cols-2 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
    <div className="min-h-72 border-b border-border bg-[#121b21] p-4 lg:border-b-0 lg:border-r">{project.image ? <img src={project.image} alt={`${project.title} project preview`} loading="lazy" data-testid={`img-project-${project.id}`} className="h-full w-full rounded-xl object-cover" /> : <ProjectPreview type={project.previewType} title={project.title} />}</div>
    <div className="flex flex-col justify-between p-6 sm:p-8"><div><div className="flex items-center justify-between font-code text-[10px] uppercase tracking-[.18em] text-primary"><span>0{index + 1} / {project.category || 'Project'}</span>{project.date && <span>{project.date}</span>}</div><h3 className="mt-6 font-display text-3xl font-semibold tracking-[-.05em] sm:text-4xl">{project.title}</h3><p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">{project.description}</p>{project.technologies?.length ? <div className="mt-6 flex flex-wrap gap-2">{project.technologies.map((tech) => <span key={tech} className="rounded-md bg-secondary px-2.5 py-1.5 font-code text-[10px] text-muted-foreground">{tech}</span>)}</div> : null}{project.features?.length ? <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">{project.features.slice(0, 4).map((feature) => <span key={feature} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Check className="size-3 text-accent" />{feature}</span>)}</div> : null}</div><div className="mt-8 flex flex-wrap gap-2"><a href={project.githubUrl} target="_blank" rel="noreferrer" data-testid={`link-project-github-${project.id}`} className="focus-ring group/link inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground">View on GitHub <ArrowUpRight className="size-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" /></a>{project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noreferrer" data-testid={`link-project-live-${project.id}`} className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground">Live demo <ExternalLink className="size-3.5" /></a> : null}</div></div>
  </article>;
}

function ProjectPreview({ type, title }: { type: string; title: string }) {
  if (type === 'goals') return <div className="h-full rounded-xl border border-[#31404b] bg-[#18242b] p-4 font-code text-[10px] text-[#b7c5c5]"><div className="flex items-center justify-between border-b border-[#31404b] pb-3"><span className="text-primary">{title}</span><span className="size-2 rounded-full bg-accent" /></div><div className="mt-5 grid grid-cols-[1fr_1.4fr] gap-3"><div className="space-y-2">{['today', 'this week', 'in progress'].map((label, index) => <div key={label} className={`rounded-lg p-2 ${index === 0 ? 'bg-primary/15 text-primary' : 'bg-[#203039]'}`}>{label}</div>)}</div><div className="rounded-lg bg-[#203039] p-3"><div className="mb-4 text-[9px] text-[#759090]">goal overview</div><div className="space-y-3">{['w-3/4', 'w-1/2', 'w-5/6'].map((width, index) => <div key={index} className="h-1 rounded-full bg-[#33474b]"><div className={`h-full rounded-full bg-accent ${width}`} /></div>)}</div></div></div></div>;
  return <div className="h-full rounded-xl border border-[#31404b] bg-[#18242b] font-code text-[10px] text-[#b7c5c5]"><div className="flex items-center gap-1 border-b border-[#31404b] px-4 py-3"><span className="size-2 rounded-full bg-[#dd7060]" /><span className="size-2 rounded-full bg-primary" /><span className="size-2 rounded-full bg-accent" /><span className="ml-auto text-[#759090]">billiblogger</span></div><div className="flex gap-4 border-b border-[#31404b] px-4 py-3 text-[#759090]"><span className="text-primary">home</span><span>categories</span><span>write</span></div><div className="grid gap-2 p-4 sm:grid-cols-2"><div className="rounded-lg bg-[#203039] p-3"><div className="mb-3 h-14 rounded bg-primary/15" /><div className="h-2 w-4/5 rounded bg-[#5d7576]" /><div className="mt-2 h-1.5 w-3/5 rounded bg-[#33474b]" /></div><div className="rounded-lg bg-[#203039] p-3"><div className="mb-3 h-14 rounded bg-accent/15" /><div className="h-2 w-3/4 rounded bg-[#5d7576]" /><div className="mt-2 h-1.5 w-1/2 rounded bg-[#33474b]" /></div></div></div>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
