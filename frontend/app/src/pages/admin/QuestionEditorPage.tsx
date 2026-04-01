import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminShell from '@components/layout/AdminShell'
import Button from '@components/ui/Button'
import Icon from '@components/ui/Icon'
import Badge from '@components/ui/Badge'

type Difficulty = 'easy' | 'medium' | 'hard'

const initialState = {
  title: '',
  topic: 'Data Structures & Algorithms',
  difficulty: 'medium' as Difficulty,
  problemStatement: '',
  constraints: '',
  example: '',
  solution: '',
  hint: '',
  concepts: [] as string[],
}

const allTopics = ['Data Structures & Algorithms', 'System Design', 'Python Mastery', 'Java Backend', 'Database & SQL']
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

const diffBadgeMap: Record<Difficulty, 'secondary' | 'neutral' | 'error'> = {
  easy: 'secondary',
  medium: 'neutral',
  hard: 'error',
}

export default function QuestionEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(initialState)
  const [newConcept, setNewConcept] = useState('')

  const addConcept = () => {
    if (newConcept.trim()) {
      setForm((f) => ({ ...f, concepts: [...f.concepts, newConcept.trim()] }))
      setNewConcept('')
    }
  }

  const removeConcept = (index: number) => {
    setForm((f) => ({ ...f, concepts: f.concepts.filter((_, i) => i !== index) }))
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline">
            {isEdit ? `Editing Question #${id}` : 'New Question'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Save Draft
          </Button>
          <Button variant="primary" size="sm" icon="publish" iconPosition="left">
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Question Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Two Sum"
              className="w-full p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Problem statement */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Problem Statement
            </label>
            <textarea
              value={form.problemStatement}
              onChange={(e) => setForm((f) => ({ ...f, problemStatement: e.target.value }))}
              rows={5}
              placeholder="Describe the problem clearly..."
              className="w-full p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Example */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Example Input / Output
            </label>
            <div className="bg-surface-container-highest dark:bg-[#0f1524] rounded-2xl overflow-hidden border border-outline-variant/50 dark:border-white/10 shadow-lg">
              <div className="px-5 py-3 flex items-center justify-between border-b border-outline-variant/50 dark:border-white/5 bg-slate-100 dark:bg-transparent">
                <div className="flex gap-2">
                  {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-full shadow-inner" style={{ background: c }} aria-hidden="true" />
                  ))}
                </div>
                <span className="text-xs font-mono text-on-surface-variant/80 dark:text-white/40 uppercase tracking-widest">example.txt</span>
              </div>
              <div className="flex bg-white dark:bg-[#050914] relative">
                <div className="py-4 pl-4 pr-3 text-right bg-slate-50 dark:bg-white/[0.02] border-r border-outline-variant/30 dark:border-white/5 select-none font-mono text-sm text-outline dark:text-white/20 hidden sm:block">
                  {Array.from({ length: Math.max(4, form.example.split('\n').length) }).map((_, i) => (
                    <div key={i} className="leading-relaxed">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={form.example}
                  onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))}
                  rows={Math.max(4, form.example.split('\n').length)}
                  placeholder={'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'}
                  className="w-full bg-transparent text-secondary dark:text-accent-100 p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none focus:bg-primary-50/30 dark:focus:bg-white/[0.02] transition-colors"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Solution */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Editorial Solution (Python)
            </label>
            <div className="bg-surface-container-highest dark:bg-[#0f1524] rounded-2xl overflow-hidden border border-outline-variant/50 dark:border-white/10 shadow-lg">
              <div className="px-5 py-3 flex items-center justify-between border-b border-outline-variant/50 dark:border-white/5 bg-slate-100 dark:bg-transparent">
                <div className="flex gap-2">
                  {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-full shadow-inner" style={{ background: c }} aria-hidden="true" />
                  ))}
                </div>
                <span className="text-xs font-mono text-on-surface-variant/80 dark:text-white/40 uppercase tracking-widest">solution.py</span>
              </div>
              <div className="flex bg-white dark:bg-[#050914] relative">
                <div className="py-4 pl-4 pr-3 text-right bg-slate-50 dark:bg-white/[0.02] border-r border-outline-variant/30 dark:border-white/5 select-none font-mono text-sm text-outline dark:text-white/20 hidden sm:block">
                  {Array.from({ length: Math.max(8, form.solution.split('\n').length) }).map((_, i) => (
                    <div key={i} className="leading-relaxed">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={form.solution}
                  onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))}
                  rows={Math.max(8, form.solution.split('\n').length)}
                  placeholder={'def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i'}
                  className="w-full bg-transparent text-secondary dark:text-accent-100 p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none focus:bg-primary-50/30 dark:focus:bg-white/[0.02] transition-colors"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-on-surface">Question Settings</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Topic</label>
              <select
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                className="w-full p-3 bg-surface-container-low border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {allTopics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${form.difficulty === d ? 'ring-2 ring-primary scale-105' : 'opacity-60 hover:opacity-80'
                      }`}
                  >
                    <Badge label={d} variant={diffBadgeMap[d]} uppercase className="w-full justify-center" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Concepts */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-on-surface">Key Concepts</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newConcept}
                onChange={(e) => setNewConcept(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addConcept()}
                placeholder="Add concept tag..."
                className="flex-1 p-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={addConcept} className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dim transition-colors">
                <Icon name="add" size="sm" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.concepts.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-semibold">
                  {tag}
                  <button onClick={() => removeConcept(i)} aria-label={`Remove ${tag}`} className="hover:opacity-70">
                    <Icon name="close" size="xs" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Hint */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <Icon name="lightbulb" className="text-primary" size="sm" />
              Author Hint
            </h3>
            <textarea
              value={form.hint}
              onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
              rows={3}
              placeholder="Provide a nudge without giving away the solution..."
              className="w-full p-3 bg-surface-container-low border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
