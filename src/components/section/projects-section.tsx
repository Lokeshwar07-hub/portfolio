import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";
import {
    StaggerItem,
    StaggerReveal,
} from "@/components/motion/stagger-reveal";

export default function ProjectsSection() {
    return (
        <section id="projects">
            <div className="flex min-h-0 flex-col gap-y-8">
                <div className="flex flex-col gap-y-4 items-center justify-center">
                    <div className="flex items-center w-full">
                        <div
                            className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent"

                        />
                        <div className="border bg-primary z-10 rounded-xl px-4 py-1">
                            <span className="text-background text-sm font-medium">My Projects</span>
                        </div>
                        <div
                            className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent"

                        />
                    </div>
                    <div className="flex flex-col gap-y-3 items-center justify-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Check out my latest work</h2>
                        <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
                            Building things for the web, solving problems, and turning ideas into reality.,
                            here&apos;s what I&apos;ve been building.
                        </p>
                    </div>
                </div>
                <StaggerReveal
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto auto-rows-fr items-stretch"
                    speed="base"
                >
                    {DATA.projects.map((project, id) => (
                        <StaggerItem
                            key={project.title}
                            className="h-full"
                        >
                            <ProjectCard
                                href={project.href}
                                key={project.title}
                                title={project.title}
                                description={project.description}
                                dates={project.dates}
                                tags={project.technologies}
                                image={project.image}
                                video={project.video}
                                mediaAspectRatio={project.mediaAspectRatio}
                                links={project.links}
                                className="h-full"
                            />
                        </StaggerItem>
                    ))}
                </StaggerReveal>
            </div>
        </section>
    );
}
