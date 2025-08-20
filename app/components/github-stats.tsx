"use client"

import { useState, useEffect } from "react"
import { Github, Star, GitFork, Code, TrendingUp } from "lucide-react"

interface Repository {
  name: string
  language: string | null
  stargazers_count: number
  forks_count: number
  size: number
  updated_at: string
  created_at: string
  default_branch: string
}

interface LanguageStats {
  name: string
  linesOfCode: number
  percentage: number
  color: string
}

interface ExtendedStats {
  totalRepos: number
  totalLinesOfCode: number
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Java: "#ed8b00",
  "C++": "#00599c",
  C: "#555555",
  HTML: "#e34f26",
  CSS: "#1572b6",
  React: "#61dafb",
  "Next.js": "#000000",
  Vue: "#4fc08d",
  Go: "#00add8",
  Rust: "#000000",
  PHP: "#777bb4",
  Ruby: "#cc342d",
  Swift: "#fa7343",
  Kotlin: "#7f52ff",
  Dart: "#0175c2",
  Shell: "#89e051",
  Other: "#8b5cf6",
}

export default function GitHubStats() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalStats, setTotalStats] = useState<ExtendedStats>({
    totalRepos: 0,
    totalLinesOfCode: 0,
  })

  useEffect(() => {
    fetchGitHubData()
  }, [])

  const fetchGitHubData = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.github.com/users/Matthewtershi/repos?per_page=100")

      if (!response.ok) {
        throw new Error("Failed to fetch repositories")
      }

      const repoData: Repository[] = await response.json()
      setRepos(repoData)

      // Calculate language statistics by lines of code
      const languageLines: Record<string, number> = {}
      let totalLinesOfCode = 0

      repoData.forEach((repo) => {
        const language = repo.language || "Other"
        // GitHub size is in KB, roughly 1 KB = 50 lines of code
        const estimatedLines = repo.size * 50
        languageLines[language] = (languageLines[language] || 0) + estimatedLines
        totalLinesOfCode += estimatedLines
      })

      const totalRepos = repoData.length
      
      const stats: LanguageStats[] = Object.entries(languageLines)
        .map(([name, lines]) => ({
          name,
          linesOfCode: Math.round(lines),
          percentage: Math.round((lines / totalLinesOfCode) * 100),
          color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other,
        }))
        .sort((a, b) => b.linesOfCode - a.linesOfCode)
        .slice(0, 5) // Top 5 languages

      setLanguageStats(stats)
      setTotalStats({
        totalRepos,
        totalLinesOfCode: Math.round(totalLinesOfCode),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-xl h-[600px] bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-2xl p-6 flex items-center justify-center border border-amber-400/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-300">Loading GitHub stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-xl h-[600px] bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-2xl p-6 flex items-center justify-center border border-red-400/30">
        <div className="text-center">
          <Github className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">Failed to load GitHub data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl h-[600px] bg-gradient-to-br from-[var(--portfolio-dark)]/80 to-[var(--portfolio-dark)]/60 rounded-2xl p-6 border border-amber-400/30 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-400/20 rounded-xl">
          <Github className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-bold text-white">Public Repository Analysis</h3>
          <p className="text-amber-300/80 text-sm">Top 5 languages by lines of code</p>
        </div>
      </div>

      {/* Simple Statistics - 2 cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center p-4 bg-gradient-to-br from-amber-400/15 to-orange-400/15 rounded-xl border border-amber-400/25">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Code className="h-5 w-5 text-amber-400" />
            <span className="text-2xl font-bold text-white">{totalStats.totalRepos}</span>
          </div>
          <p className="text-amber-300 text-sm font-medium">Repositories</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-amber-400/15 to-orange-400/15 rounded-xl border border-amber-400/25">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <span className="text-2xl font-bold text-white">{Math.round(totalStats.totalLinesOfCode / 1000)}</span>
          </div>
          <p className="text-amber-300 text-sm font-medium">K Lines of Code</p>
        </div>
      </div>

      {/* Top Languages by Lines of Code */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          <h4 className="text-lg font-semibold text-white">Top Languages</h4>
        </div>
        <div className="space-y-3">
          {languageStats.map((lang, index) => (
            <div key={lang.name} className="relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30" style={{ backgroundColor: lang.color }} />
                  <span className="text-white text-sm font-medium">{lang.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 text-sm font-bold">{Math.round(lang.linesOfCode / 1000)}K</span>
                  <span className="text-amber-300/70 text-xs ml-1">({lang.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-700/40 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                    boxShadow: `0 0 8px ${lang.color}40`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
