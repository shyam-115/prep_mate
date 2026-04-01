import Card from '@components/ui/Card'
import Badge from '@components/ui/Badge'
import Button from '@components/ui/Button'
import Icon from '@components/ui/Icon'
import type { MilestoneItem as MilestoneItemType, ActivityDay } from '@types-app/index'

const currentPath = {
  title: 'Distributed Systems',
  tag: 'ACTIVE PATH',
  lastSession: 'Last session: Consensus Algorithms',
  progressPercent: 64,
  icon: 'dynamic_feed',
}

const milestones: MilestoneItemType[] = [
  { id: '1', title: 'Dynamic Programming', subtitle: "Mastered 'Knapsack Problem'", timeAgo: '2D AGO' },
  { id: '2', title: 'Tree Traversals', subtitle: 'Finished DFS & BFS Deep-dive', timeAgo: '4D AGO' },
  { id: '3', title: 'Big O Notation', subtitle: 'Complexity Analysis Intro', timeAgo: '1W AGO' },
]

const activityData: ActivityDay[] = [
  { label: 'M', heightClass: 'h-24', intensity: 'low' },
  { label: 'T', heightClass: 'h-32', intensity: 'medium' },
  { label: 'W', heightClass: 'h-44', intensity: 'high' },
  { label: 'T', heightClass: 'h-16', intensity: 'low' },
  { label: 'F', heightClass: 'h-28', intensity: 'medium' },
  { label: 'S', heightClass: 'h-12', intensity: 'low' },
  { label: 'S', heightClass: 'h-8', intensity: 'low' },
]

const streakDays = 14
const streakMax = 21

export default function DashboardPage() {
  return (
    <>
      {/* Page header */}
      <header className="mb-12 relative">
        <h1 className="text-[2rem] md:text-[3.5rem] leading-tight font-black text-on-surface dark:text-white font-headline tracking-tighter mb-4 animate-slide-up">
          Welcome back, Zen.
        </h1>
        <p className="text-xl text-on-surface-variant dark:text-white/70 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          You've solved 12 problems this week. Your performance in{' '}
          <span className="text-primary-600 dark:text-primary-400 font-bold tracking-wide">Graph Theory</span> has improved by 24%.
        </p>
      </header>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {/* Continue Learning — 8 cols */}
        <section className="md:col-span-8">
          <Card hover variant="elevated" className="h-full">
            <div className="flex justify-between items-start mb-16 relative z-10">
              <div>
                <Badge label={currentPath.tag} variant="primary" uppercase className="mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                <h3 className="text-4xl font-black font-headline mb-3 text-on-surface dark:text-white tracking-tight">{currentPath.title}</h3>
                <p className="text-on-surface-variant dark:text-white/60 text-lg">{currentPath.lastSession}</p>
              </div>
              <div className="h-24 w-24 flex items-center justify-center bg-surface-hover dark:bg-white/5 border border-outline-variant/50 dark:border-white/10 rounded-2xl flex-shrink-0 shadow-inner">
                <Icon name={currentPath.icon} className="text-primary-600 dark:text-primary-400" size="xl" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-8 relative z-10">
              <div className="flex-1 max-w-md">
                <div className="mb-2 flex justify-between text-sm font-bold text-on-surface-variant dark:text-white/80">
                  <span>Progress</span>
                  <span className="text-primary-600 dark:text-primary-400">{currentPath.progressPercent}%</span>
                </div>
                {/* Visual replacement for ProgressBar to ensure dark mode looks good */}
                <div className="h-3 w-full bg-outline-variant/50 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-500 dark:to-accent-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${currentPath.progressPercent}%` }}
                  />
                </div>
              </div>
              <Button variant="primary" size="lg" icon="arrow_forward" className="px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                Resume
              </Button>
            </div>
          </Card>
        </section>

        {/* Streak tracker — 4 cols */}
        <section className="md:col-span-4">
          <Card hover variant="surface-low" className="h-full flex flex-col items-center justify-center text-center">
            {/* Inline simplified CircularProgress to ensure colors match theme perfectly */}
            <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" className="text-outline-variant dark:text-white/10" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="url(#streakGradient)"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - streakDays / streakMax)}`}
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] dark:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center absolute">
                <span className="block text-4xl font-black text-on-surface dark:text-white">{streakDays}</span>
                <span className="text-sm font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest">Days</span>
              </div>
            </div>

            <h4 className="text-2xl font-bold font-headline mb-3 text-on-surface dark:text-white">Consistency is Key</h4>
            <p className="text-on-surface-variant dark:text-white/60 leading-relaxed px-4">
              You're in the top 5% of daily active learners this month.
            </p>
            <div className="mt-8 flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${i < 3
                      ? 'bg-accent-500/10 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400 border border-accent-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)] dark:shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-surface-hover dark:bg-white/5 text-outline-variant dark:text-white/20 border border-outline-variant dark:border-white/5'
                    }`}
                >
                  <Icon
                    name="local_fire_department"
                    size="sm"
                    filled={i < 3}
                  />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Activity chart */}
        <section className="md:col-span-7">
          <Card hover className="h-full">
            <h3 className="text-xl font-bold font-headline text-on-surface dark:text-white mb-8">Activity</h3>
            <div className="flex items-end justify-between h-[200px] gap-2">
              {activityData.map((day, i) => {
                const colors: Record<string, string> = {
                  low: 'bg-outline-variant/50 hover:bg-outline-variant/80 dark:bg-white/10 dark:hover:bg-white/20',
                  medium: 'bg-primary-500/30 hover:bg-primary-500/50 dark:bg-primary-500/50 dark:hover:bg-primary-500/70 border border-primary-500/30',
                  high: 'bg-primary-600 hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 border border-primary-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.6)]',
                }
                return (
                  <div key={i} className="flex flex-col items-center gap-4 flex-1 group cursor-pointer">
                    <div className={`w-full rounded-t-md transition-all duration-300 ${day.heightClass} ${colors[day.intensity]} group-hover:scale-105 origin-bottom`} />
                    <span className="text-sm font-bold text-on-surface-variant dark:text-white/50 group-hover:text-on-surface dark:group-hover:text-white transition-colors">{day.label}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </section>

        {/* Recent milestones */}
        <section className="md:col-span-5">
          <Card hover variant="surface-low" className="h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-headline text-on-surface dark:text-white">Recent Milestones</h3>
              <a href="#" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:underline">
                View All
              </a>
            </div>
            <div className="space-y-4">
              {milestones.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-hover dark:bg-white/5 border border-outline-variant/50 dark:border-white/5 hover:bg-outline-variant/30 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-accent-500/10 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <Icon name="emoji_events" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-on-surface dark:text-white font-bold truncate">{item.title}</h4>
                    <p className="text-on-surface-variant dark:text-white/60 text-sm truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant/70 dark:text-white/40 tracking-wider whitespace-nowrap">{item.timeAgo}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Recommendation banner */}
        <section className="md:col-span-12">
          <Card hover variant="elevated" className="group !p-12 overflow-hidden border border-accent-500/30 shadow-lg dark:shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            {/* Gradient overlay */}

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-8">
                <span className="inline-block px-3 py-1 rounded-full bg-accent-500/10 dark:bg-accent-500/20 text-accent-600 dark:text-accent-300 border border-accent-500/20 dark:border-accent-500/30 font-bold text-xs tracking-widest uppercase mb-6 shadow-[0_0_10px_rgba(168,85,247,0.2)] dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  ⚡ Recommended for you
                </span>
                <h2 className="text-4xl md:text-5xl font-black font-headline text-on-surface dark:text-white mb-6 leading-tight tracking-tight">
                  Mastering System Design: <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-300 dark:to-accent-300">Scalability & HA</span>
                </h2>
                <p className="text-on-surface-variant dark:text-white/80 text-lg mb-8 max-w-2xl leading-relaxed">
                  Our AI analyzed your recent activity. You're ready to tackle large-scale architecture
                  challenges. Start your 3-hour deep dive now.
                </p>
                <Button variant="primary" size="lg" className="shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(59,130,246,0.6)] px-10">
                  Start Module
                </Button>
              </div>
              <div className="hidden md:flex md:col-span-4 justify-center">
                <div className="w-48 h-48 bg-surface-hover dark:bg-white/5 border border-outline-variant dark:border-white/20 rounded-full flex items-center justify-center relative shadow-lg dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-700">
                  <div className="absolute inset-2 border border-dashed border-outline-variant dark:border-white/30 rounded-full animate-[spin_20s_linear_infinite]" />
                  <Icon name="architecture" size="xl" className="text-primary-600 dark:text-white !text-6xl drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </>
  )
}