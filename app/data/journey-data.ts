import type { LucideIcon } from "lucide-react"
import { Brain, Code, Leaf, Trophy, Target, GraduationCap } from "lucide-react"

export interface Experience {
  year: string
  category: string
  title: string
  description: string
  tools: string[]
  icon: LucideIcon
  position: "top" | "bottom"
  imageUrl?: string
}

export const experiences: Experience[] = [
  {
    year: "2025",
    category: "Internship",
    title: "Energy System Laboratory",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80",
    description: "Designed preprocessing pipelines for ML and OCR models in HVAC fault detection",
    tools: ["ASP.NET", "Azure Machine Learning", "AWS", "Blazor"],
    icon: Brain,
    position: "top",
  },
  {
    year: "2024",
    category: "Research",
    title: "Climate Hydrology Lab",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80",
    description: "Designed models and dashboards for CDR and ocean alkalinization at scale",
    tools: ["Juypter", "Django", "PostgreSQL", "Docker"],
    icon: Leaf,
    position: "bottom",
  },
  {
    year: "2024",
    category: "Leadership",
    title: "Tidal TAMU Activities Director",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80",
    description: "Led the organization through hackathons and workshops for 400+ students in collaboration with AWS, Jane Street, and many others",
    tools: ["TypeScript", "MongoDB", "Node.js"],
    icon: Code,
    position: "top",
  },
  {
    year: "2024",
    category: "Competition",
    title: "HowdyHack",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    description: "Built a wildfire prediction app that reached 86% accuracy and placed Top 4 at HowdyHack 2024",
    tools: ["Next.js", "Python", "TensorFlow", "Flask"],
    icon: Trophy,
    position: "bottom",
  },
  {
    year: "2024",
    category: "Project",
    title: "Baseball Swing Analysis Model",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80",
    description: "Developed a LSTM model to classify swings, diagnose swing faults, and provide feedback to players",
    tools: ["TensorFlow", "OpenCV", "Mediapipe"],
    icon: Target,
    position: "top",
  },
  {
    year: "2024",
    category: "Education",
    title: "Enrolled in CE @ TAMU",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80",
    description: "Began post-secondary education @ TAMU - ECE Major Math Minor",
    tools: ["C++", "Python", "MATLAB"],
    icon: GraduationCap,
    position: "bottom",
  },
]
