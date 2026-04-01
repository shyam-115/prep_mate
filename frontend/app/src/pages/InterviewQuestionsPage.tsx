import { useState } from 'react'
import Icon from '@components/ui/Icon'

type Difficulty = 'easy' | 'medium' | 'hard'
type FilterTab = 'all' | Difficulty

interface Question {
  id: string
  title: string
  number: number
  difficulty: Difficulty
  concepts: string[]
  solution: string
  example: { input: string; output: string }
  insight: string
}

const questions: Question[] = [
  {
    id: 'q1', title: 'Two Sum', number: 1, difficulty: 'easy',
    concepts: ['Hash Maps', 'Array Traversal', 'O(n) Time Complexity'],
    solution: `def twoSum(nums, target):\n    prevMap = {}  # val : index\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i`,
    example: { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
    insight: 'By using a Hash Map, we trade space for time. We only iterate through the list once, looking for the complement of the current number.',
  },
  {
    id: 'q2', title: 'Valid Anagram', number: 242, difficulty: 'easy',
    concepts: ['Frequency Counting', 'Sorting', 'String Manipulation'],
    solution: `def isAnagram(s, t):\n    if len(s) != len(t):\n        return False\n    countS, countT = {}, {}\n    for i in range(len(s)):\n        countS[s[i]] = 1 + countS.get(s[i], 0)\n        countT[t[i]] = 1 + countT.get(t[i], 0)\n    return countS == countT`,
    example: { input: 's = "anagram", t = "nagaram"', output: 'true' },
    insight: 'Character frequency counting is the key insight. Two strings are anagrams if and only if they have identical character frequencies.',
  },
  {
    id: 'q3', title: 'Merge Intervals', number: 56, difficulty: 'medium',
    concepts: ['Sorting', 'Greedy', 'Arrays'],
    solution: `def merge(intervals):\n    intervals.sort(key=lambda i: i[0])\n    output = [intervals[0]]\n    for start, end in intervals[1:]:\n        lastEnd = output[-1][1]\n        if start <= lastEnd:\n            output[-1][1] = max(lastEnd, end)\n        else:\n            output.append([start, end])\n    return output`,
    example: { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
    insight: 'Sorting by start time guarantees that overlapping intervals are adjacent. Then a simple linear scan can merge them greedily.',
  },
]

const difficultyColor: Record<Difficulty, string> = {
  easy: 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
  medium: 'bg-accent-500/10 text-accent-400 border border-accent-500/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
  hard: 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
}

export default function InterviewQuestionsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = activeTab === 'all' ? questions : questions.filter((q) => q.difficulty === activeTab)
  const tabs: { key: FilterTab; label: string; dot?: string }[] = [
    { key: 'all', label: 'All Challenges' },
    { key: 'easy', label: 'Easy', dot: 'bg-primary-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]' },
    { key: 'medium', label: 'Medium', dot: 'bg-accent-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]' },
    { key: 'hard', label: 'Hard', dot: 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' },
  ]

  return (
    <>
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-16 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="font-headline text-5xl md:text-7xl font-black text-on-surface dark:text-white tracking-tighter mb-6">
          Algorithm Mastery
        </h1>
        <p className="text-on-surface-variant dark:text-white/70 text-xl max-w-2xl leading-relaxed">
          A curated collection of industry-standard coding challenges. Focused, distraction-free, and architected for deep learning.
        </p>

        {/* Filter tabs */}
        <div className="mt-12 flex flex-wrap items-center gap-6 md:gap-10 border-b border-outline-variant/60 dark:border-white/10 pb-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-4 text-base flex items-center gap-3 border-b-2 transition-all -mb-px ${
                activeTab === t.key
                  ? 'border-primary-400 text-primary-400 font-bold'
                  : 'border-transparent text-on-surface-variant dark:text-white/50 hover:text-on-surface dark:hover:text-white hover:border-outline-variant dark:hover:border-white/20 font-medium'
              }`}
            >
              {t.dot && <span className={`w-2 h-2 rounded-full ${t.dot}`} />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question cards */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {filtered.map((q) => {
          const isOpen = openId === q.id
          return (
            <article key={q.id} className="glass-panel hover:bg-slate-50 dark:hover:bg-white/[0.07] border-outline-variant/60 dark:border-white/10 rounded-[2rem] p-8 md:p-10 transition-all duration-300 group">
              {/* Card header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-xl ${difficultyColor[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-on-surface-variant/70 dark:text-white/40 text-sm font-medium tracking-wide">Problem #{q.number}</span>
                  </div>
                  <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-white tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                    {q.title}
                  </h2>
                </div>
                <button
                  className="p-4 bg-slate-100 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary-500/20 text-on-surface-variant dark:text-white/50 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-500/30"
                  aria-label="Bookmark"
                >
                  <Icon name="bookmark" size="sm" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-8">
                {/* Example */}
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border-l-4 border-primary-500 shadow-inner">
                  <p className="text-sm font-mono text-on-surface-variant dark:text-white/60 italic mb-2">Example: {q.example.input}</p>
                  <p className="text-sm font-mono text-on-surface dark:text-white font-bold">Output: {q.example.output}</p>
                </div>

                {/* Concepts */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface-variant/70 dark:text-white/40 uppercase tracking-widest mb-4">Key Concepts Used</h3>
                  <div className="flex flex-wrap gap-3">
                    {q.concepts.map((c) => (
                      <span key={c} className="px-5 py-2 bg-white dark:bg-white/5 border border-outline-variant dark:border-white/10 text-on-surface-variant dark:text-white/70 text-sm font-medium rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-default">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expandable solution */}
                <div className="border-t border-outline-variant/60 dark:border-white/10 mt-8">
                  <button
                    onClick={() => setOpenId(isOpen ? null : q.id)}
                    className="flex items-center justify-between w-full py-6 text-left group/btn"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-primary-400 flex items-center gap-3 text-lg group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-300 transition-colors">
                      <Icon name="auto_awesome" size="sm" />
                      View Editorial Solution
                    </span>
                    <div className={`w-8 h-8 rounded-full border border-outline-variant/60 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-500/20 border-primary-500/30 text-primary-400' : 'text-on-surface-variant dark:text-white/50'}`}>
                      <Icon
                        name="expand_more"
                        size="sm"
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pt-4 pb-6 animate-slide-up">
                      <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 overflow-hidden relative shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Python 3</span>
                          <button className="text-white/40 hover:text-white transition-colors" aria-label="Copy code">
                            <Icon name="content_copy" size="sm" />
                          </button>
                        </div>
                        <pre className="text-accent-200 text-sm leading-relaxed overflow-x-auto font-mono whitespace-pre selection:bg-accent-500/30">
                          {q.solution}
                        </pre>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-[50px] pointer-events-none"></div>
                      </div>
                      {q.insight && (
                        <div className="mt-6 p-6 bg-accent-500/10 rounded-2xl border border-accent-500/20 shadow-inner backdrop-blur-sm">
                          <p className="text-on-surface-variant dark:text-white/80 leading-relaxed text-sm">
                            <strong className="text-accent-600 dark:text-accent-400 tracking-wide">INSIGHT:</strong> <br/>{q.insight}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}

        {/* Level-up CTA */}
        <div className="mt-12 relative overflow-hidden rounded-[3rem] h-80 flex items-center justify-center border border-primary-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] group cursor-pointer" onClick={() => setActiveTab('medium')}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-accent-600/80 group-hover:opacity-90 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10 text-center p-8 scale-95 group-hover:scale-100 transition-transform duration-500">
            <h3 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Ready for Medium?
            </h3>
            <p className="text-white/90 mb-8 text-lg font-medium drop-shadow-sm">
              You've mastered the basics. Level up your system thinking.
            </p>
            <div className="inline-block px-10 py-4 bg-white text-primary-600 rounded-full font-bold shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
              Browse Medium Challenges
            </div>
          </div>
        </div>

        <div className="h-20" />
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary-600 text-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center hover:scale-110 hover:bg-primary-500 transition-all z-50 border border-primary-400" aria-label="Notes">
        <Icon name="history_edu" size="lg" />
      </button>
    </>
  )
}
