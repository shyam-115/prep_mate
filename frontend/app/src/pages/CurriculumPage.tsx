import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '@components/layout/Navbar'
import Card from '@components/ui/Card'
import Icon from '@components/ui/Icon'

interface Topic {
  id: string
  title: string
  tag: string
  progress: number
}

const mockCourseData: Record<string, { title: string; subtitle: string; description: string; topics: Topic[] }> = {
  dsa: {
    title: 'Data Structures Core Mastery.',
    subtitle: 'CURRICULUM',
    description: 'Explore the fundamental building blocks of software engineering. This track bridges the gap between basic implementation and high-level architectural optimization.',
    topics: [
      { id: 'arrays-strings', title: 'Arrays & Strings',       tag: 'FOUNDATIONAL', progress: 85 },
      { id: 'linked-lists',   title: 'Linked Lists',           tag: 'ACTIVE',        progress: 66 },
      { id: 'trees-graphs',   title: 'Trees & Graphs',         tag: 'ADVANCED',      progress: 0  },
    ],
  },
  'sys-design': {
    title: 'System Design',
    subtitle: 'CURRICULUM',
    description: 'Architecting large-scale distributed systems from DNS to eventual consistency.',
    topics: [
      { id: 'dist-systems', title: 'Distributed Systems', tag: 'FOUNDATIONAL', progress: 25 },
    ],
  },
}

export default function CurriculumPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const courseData = courseId ? mockCourseData[courseId] : undefined

  // ── Not found state ───────────────────────────────────────────────────────
  if (!courseData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar showSearch={false} />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center mb-8">
            <Icon name="search_off" className="text-on-surface-variant !text-4xl" />
          </div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-3">Course Not Found</h1>
          <p className="text-on-surface-variant max-w-sm mb-8">
            The course{' '}
            <code className="px-2 py-0.5 bg-surface-container rounded-lg text-sm font-mono">{courseId}</code>{' '}
            doesn't exist yet. Browse the library to find available tracks.
          </p>
          <button
            onClick={() => navigate('/library')}
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Browse Library
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col font-sans">
      <Navbar showSearch={false} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-12 lg:py-16">

        {/* Back navigation */}
        <button
          onClick={() => navigate('/library')}
          className="flex items-center text-sm font-bold text-on-surface-variant hover:text-primary transition-all mb-10 group"
        >
          <Icon name="arrow_back" size="sm" className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </button>

        {/* Header */}
        <header className="mb-16 relative z-10 animate-slide-up flex flex-col items-center text-center">
          <div className="mb-6">
            <span className="px-4 py-1 text-xs font-bold uppercase tracking-widest
              bg-primary/10 text-primary rounded-full
              shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {courseData.subtitle}
            </span>
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black
            text-transparent bg-clip-text bg-gradient-to-r
            from-on-surface to-on-surface-variant
            dark:from-white dark:to-white/70
            tracking-tight mb-6 max-w-3xl">
            {courseData.title}
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant
            dark:text-white/70 leading-relaxed max-w-2xl font-body">
            {courseData.description}
          </p>
        </header>

        {/* Timeline */}
        <div className="relative">
          {/* Gradient timeline line */}
          <div className="absolute left-[10px] top-6 bottom-6 w-[2px]
            bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />

          <div className="space-y-6">
            {courseData.topics.map((topic, index) => (
              <div
                key={topic.id}
                className="relative pl-12 group"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Node marker */}
                <div className="absolute left-[3px] top-[28px] w-[18px] h-[18px] rounded-full
                  border-[3px] border-background bg-primary
                  shadow-[0_0_10px_rgba(59,130,246,0.5)]
                  group-hover:scale-125 transition-transform duration-300 z-10" />

                <Card
                  variant="default"
                  className="cursor-pointer
                    hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5
                    transition-all duration-300"
                  onClick={() => navigate(`/app/learn/topics/${topic.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* Left: tag + title */}
                    <div className="flex-1">
                      <span className={`inline-block text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md border mb-2
                        ${topic.tag === 'FOUNDATIONAL'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : topic.tag === 'ACTIVE'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-on-surface-variant/5 text-on-surface-variant border-on-surface-variant/10'
                        }`}>
                        {topic.tag}
                      </span>

                      <h2 className="text-2xl font-black font-headline text-on-surface dark:text-white
                        group-hover:text-primary transition-colors duration-300">
                        {topic.title}
                      </h2>
                    </div>

                    {/* Right: progress badge + arrow */}
                    <div className="flex items-center gap-4 shrink-0">
                      {topic.progress > 0 && (
                        <div className="flex flex-col items-end gap-0.5 px-4 py-2 bg-surface-container rounded-xl">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Progress</span>
                          <span className="text-sm font-black text-primary">{topic.progress}%</span>
                        </div>
                      )}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center
                        bg-surface-container/60
                        group-hover:bg-primary group-hover:text-white
                        transition-all duration-300">
                        <Icon name="arrow_forward" size="sm" />
                      </div>
                    </div>

                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="py-8 text-center text-sm text-on-surface-variant border-t border-outline-variant/10 w-full mt-auto">
        PrepMate © 2026. Engineering excellence through mindful preparation.
      </footer>
    </div>
  )
}
