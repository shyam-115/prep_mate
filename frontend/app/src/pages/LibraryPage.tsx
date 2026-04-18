import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import Navbar from '@components/layout/Navbar'
import Card from '@components/ui/Card'
import Badge from '@components/ui/Badge'
import Icon from '@components/ui/Icon'
import ProgressBar from '@components/ui/ProgressBar'

export default function LibraryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const courses = [
    {
      id: 'dsa',
      title: 'Data Structures & Algorithms',
      description: 'Master the intricacies of B-Trees, Segment Trees, and Disjoint Sets to solve complex problems.',
      progress: 75,
      totalTopics: 40,
      completedTopics: 30,
      tag: 'FOUNDATIONAL',
      icon: 'account_tree',
    },
    {
      id: 'ai',
      title: 'Artificial Intelligence',
      description: 'Explore neural networks, backpropagation, and fundamental AI concepts from the ground up.',
      progress: 30,
      totalTopics: 40,
      completedTopics: 12,
      tag: 'ADVANCED',
      icon: 'smart_toy',
    },
    {
      id: 'ml',
      title: 'Machine Learning',
      description: 'Deep dive into regression, classification, clustering, and predictive modeling techniques.',
      progress: 0,
      totalTopics: 15,
      completedTopics: 0,
      icon: 'monitoring',
    },
    {
      id: 'sys-design',
      title: 'System Design',
      description: 'Architecting large scale distributed systems from DNS to eventual consistency.',
      progress: 25,
      totalTopics: 20,
      completedTopics: 5,
      icon: 'architecture',
    },
    {
      id: 'graph',
      title: 'Graph Theory',
      description: 'Advanced traversal techniques and shortest path optimizations.',
      unlockLevel: 5,
      icon: 'lock',
    }
  ]

  return (
    <div className="min-h-screen bg-background relative flex flex-col font-sans">
      <Navbar showSearch={false} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 lg:py-16">

        {/* Back to Dashboard */}
        {/* {user && (
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-10"
          >
            <Icon name="arrow_back" size="sm" />
            Back to Dashboard
          </button>
        )} */}

        <header className="mb-16 relative z-10 animate-slide-up flex flex-col items-center text-center">

          {/* Badge / Label */}
          <div className="mb-6">
            <span className="px-4 py-1 text-xs font-bold uppercase tracking-widest 
      bg-primary/10 text-primary rounded-full 
      shadow-[0_0_15px_rgba(59,130,246,0.25)]">
              CURATED TRACKS
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black 
    text-transparent bg-clip-text bg-gradient-to-r 
    from-on-surface to-on-surface-variant 
    dark:from-white dark:to-white/70 
    tracking-tight mb-6 max-w-3xl">

            The Library
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-on-surface-variant 
    dark:text-white/70 leading-relaxed 
    max-w-2xl font-body">

            A curated collection of curriculum paths engineered for deep technical mastery.
            Select a domain and initiate focused, high-leverage learning cycles.
          </p>

        </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              variant="default"
              hover={true}
              className="flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/library/${course.id}`)}
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <Icon name={course.icon} size="md" />
                </div>

                {course.tag && (
                  <Badge label={course.tag} variant="primary" uppercase className="!text-[10px]" />
                )}

                {course.progress !== undefined && course.progress > 0 && course.progress < 100 && (
                  <span className="text-sm font-bold text-primary">
                    {course.progress}% Complete
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold font-headline mb-3 text-on-surface">
                  {course.title}
                </h3>

                <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                  {course.description}
                </p>
              </div>

              {/* ALWAYS SHOW PROGRESS */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{course.completedTopics}/{course.totalTopics} Topics</span>
                </div>

                <ProgressBar
                  value={course.progress ?? 0}
                  showLabel={false}
                  size="sm"
                  className="mb-6"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent double navigation
                    navigate(`/library/${course.id}`);
                  }}
                  className="flex items-center text-primary font-bold hover:text-primary-dim transition-colors pb-2"
                >
                  View Topics <Icon name="arrow_forward" size="sm" className="ml-1" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-on-surface-variant border-t border-outline-variant/10 w-full">
        PrepMate © 2026. Engineering excellence through mindful preparation.
      </footer>
    </div>
  )
}
