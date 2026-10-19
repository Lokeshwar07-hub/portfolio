import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import { Kubernetes } from "@/components/ui/svgs/kubernetes";
import { Java } from "@/components/ui/svgs/java";
import { Csharp } from "@/components/ui/svgs/csharp";
import { SiDocker, SiFastapi, SiGithub, SiGit, SiLangchain, SiLanggraph, SiNumpy, SiPandas, SiScikitlearn, SiSupabase, SiTensorflow } from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { FaProjectDiagram } from "react-icons/fa";
import { FaBrain, FaChartBar, FaChartLine, FaComments, FaFlag, FaLanguage, FaPuzzlePiece, FaUsers } from "react-icons/fa6";

export const DATA = {
  name: "Lokeshwar Sikarwar",
  initials: "LS",
  url: "http://localhost:3000",
  location: "INDIA / Open to Remote",
  locationLink: "https://www.google.com/maps/place/India",
  description:
    "Computer Science student and full-stack web developer focused on building practical, modern web applications.",
  summary:
    "Hi, my name is Lokeshwar Sikarwar, a Computer Science student at Manipal University Jaipur. I enjoy building practical web applications and learning modern web development technologies.\n\nI work primarily with JavaScript, React, Next.js, Node.js, Express, MongoDB, and REST APIs. I am currently focused on improving my full-stack development skills by building real-world projects and understanding how applications work from frontend to backend.\n\nWhen I'm not coding, I enjoy working on projects, exploring new technologies, and contributing to student tech communities.",
  avatarUrl: "/profile-desk.jpg",

  openSource: [],

  skills: [
    { name: "HTML", icon: ReactLight, color: "#d62e00" },
    { name: "CSS", icon: ReactLight, color: "#1572B6" },
    { name: "JavaScript", icon: ReactLight, color: "#F7DF1E" },
    { name: "React", icon: ReactLight, color: "#61DAFB" },
    { name: "Next.js", icon: NextjsIconDark, color: "#FFFFFF" },
    { name: "TypeScript", icon: Typescript, color: "#3178C6" },
    { name: "Node.js", icon: Nodejs, color: "#339933" },
    { name: "Express.js", icon: Nodejs, color: "#FFFFFF" },
    { name: "MongoDB", icon: SiSupabase, color: "#082e08" },
    { name: "SQL", icon: Postgresql, color: "#336791" },
    { name: "Java", icon: Java, color: "#F89820" },
    { name: "Python", icon: Python, color: "#3776AB" },
    { name: "Git", icon: SiGit, color: "#F05032" },
    { name: "GitHub", icon: SiGithub, color: "#FFFFFF" },
    { name: "VS Code", icon: VscVscode, color: "#007ACC" },
    { name: "REST APIs", icon: FaProjectDiagram, color: "#38BDF8" },
    { name: "Problem Solving", icon: FaPuzzlePiece, color: "#2DD4BF" },
    { name: "Leadership", icon: FaFlag, color: "#FB7185" },
    { name: "Communication", icon: FaComments, color: "#FDE68A" },
    { name: "Collaboration", icon: FaUsers, color: "#60A5FA" },
  ],

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
  ],

  contact: {
    email: "lokeshwarwork007@gmail.com",
    tel: "8273602933",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Lokeshwar07-hub",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/lokeshwar-sikarwar-a3084327a?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/Lokeshwar2207",
        icon: Icons.x,
        navbar: true,
      },
      Instagram: {
        name: "Instagram",
        url: "https://www.instagram.com/lokeshwar_sikarwar?cplk=MXVnbndsYXRsMHhnNw%3D%3D",
        icon: Icons.globe,
        navbar: true,
      },
      email: {
        name: "Email",
        url: "sikarwarlokeshwar@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "IEEE Robotics and Automation Society (IEEE RAS MUJ)",
      href: "#",
      badges: [],
      location: "Manipal University Jaipur",
      title: "General Secretary",
      logoUrl: "/muj.jpg",
      start: "2025",
      end: "Present",
      description:
        "Working on event logistics, coordination, planning, and execution for IEEE RAS MUJ activities. • Coordinating with teams to manage event requirements and on-ground execution. • Supporting planning and smooth delivery of technical events and club activities.",
    },
  ],

  education: [
    {
      school: "Manipal University Jaipur",
      href: "https://jaipur.manipal.edu",
      degree: "Bachelor of Technology (B.Tech), Computer Science – Data Science",
      logoUrl: "/muj.jpg",
      start: "2024",
      end: "2028",
    },
    {
      school: "Shree RAM International School",
      href: "",
      degree: "Class 12 - Integrated PCM",
      logoUrl: "/shree.png",
      start: "2021",
      end: "2023",
    },
    {
      school: "DR. MPS World School",
      href: "",
      degree: "Class 10",
      logoUrl: "/mps.png",
      start: "2010",
      end: "2021",
    },

  ] as Array<{
    school: string;
    href: string;
    degree: string;
    logoUrl: string;
    start: string;
    end: string;
  }>,

  projects: [
    {
      title: "BilliBlogger",
      href: "https://github.com/Lokeshwar07-hub/billi-blogger",
      dates: "2026",
      active: true,
      description:
        "Full-stack blogging platform built with Node.js and Express where users can create and manage blog posts, upload images, and work with persistent MongoDB data.",
      technologies: ["Node.js", "Express.js", "MongoDB", "EJS", "Cloudinary"],
      video: undefined,
      links: [
        {
          type: "Source",
          href: "https://github.com/Lokeshwar07-hub/billi-blogger",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/billiblogger.png",
      mediaAspectRatio: "16 / 9",
    },
    {
      title: "goal-tracker-pro",
      href: "https://github.com/Lokeshwar07-hub/goal-tracker-pro",
      dates: "2026",
      active: false,
      description:
        "Enterprise goal management portal (React + Vite frontend, Express API, SQLite database).",
      technologies: ["Node.js", "Express.js", "MongoDB", "JavaScript"],
      video: undefined,
      links: [
        {
          type: "Source",
          href: "https://github.com/Lokeshwar07-hub/goal-tracker-pro",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/goal-tracker-pro.png",
      mediaAspectRatio: "16 / 9",
    },
  ],

  hackathons: [],
} as const;
