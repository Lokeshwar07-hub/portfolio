export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  features: string[];
  githubUrl: string;
  liveUrl: string;
  image: string;
  previewType: string;
  featured: boolean;
  category: string;
  date: string;
}

export const projects: Project[];