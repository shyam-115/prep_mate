import Icon from '@components/ui/Icon'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'

interface Section {
  id: string
  title: string
  content: string
  codeExample?: { filename: string; code: string }
  highlight?: { label: string; quote: string }
  callouts?: { icon: string; iconColor: string; title: string; desc: string }[]
}

const sections: Section[] = [
  {
    id: 'intro',
    title: 'Why Python?',
    content: 'Python is an interpreted, high-level, general-purpose programming language. Created by Guido van Rossum and first released in 1991, its design philosophy emphasizes code readability with its notable use of significant whitespace. For system designers and architects, Python serves as the ultimate glue — scripting infrastructure, building high-performance APIs, and prototyping machine learning models.',
    highlight: {
      label: 'Key Philosophy',
      quote: '"Beautiful is better than ugly. Explicit is better than implicit. Simple is better than complex."',
    },
    callouts: [
      { icon: 'bolt', iconColor: 'text-accent-400', title: 'Rapid Prototyping', desc: 'Go from concept to working prototype in hours, not days.' },
      { icon: 'hub', iconColor: 'text-primary-400', title: 'Massive Ecosystem', desc: 'Over 300,000 packages available via PyPI for every imaginable task.' },
    ],
  },
  {
    id: 'clean-slate',
    title: 'The Clean Slate',
    content: 'Unlike many other languages that rely on curly braces, Python uses indentation. This isn\'t just a stylistic choice — it\'s enforced by the compiler. Notice the lack of semicolons and types. While Python is dynamically typed, it supports type hinting for larger projects.',
    codeExample: {
      filename: 'hello_world.py',
      code: `def greet_user(name: str) -> bool:\n    # A simple greeting function\n    message = f"Hello, {name}!"\n    print(message)\n    return True\n\ngreet_user("Architect")`,
    },
  },
]

const tocItems = ['Introduction', 'The Clean Slate', 'Code Example', 'Architectural Impact', 'Next Steps']

export default function TopicPagePython() {
  return (
    <>
      {/* Progress rail under navbar */}
      <div className="fixed top-[72px] left-0 w-full h-[3px] bg-outline-variant/60 dark:bg-white/10 z-40">
        <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 w-[35%] shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
      </div>

      <div className="min-h-screen grid grid-cols-1 xl:grid-cols-[1fr_320px] relative">        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-100/50 dark:from-primary-900/20 to-transparent pointer-events-none"></div>

        {/* Main reader */}
        <main className="w-full flex justify-center relative z-10">
          <div className="w-full max-w-4xl px-6 md:px-10 py-16 md:py-24">
            <header className="mb-20 relative z-10 flex flex-col items-center text-center">

              {/* Glow background */}
              <div className="absolute -top-20 w-[500px] h-[300px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none"></div>

              {/* Badge */}
              <div className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase 
    bg-primary-500/10 border border-primary-500/30 text-primary-300 
    shadow-[0_0_20px_rgba(59,130,246,0.25)] mb-6">
                Deep Dive Module
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black 
    text-on-surface dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r 
    dark:from-white dark:via-white dark:to-white/70 
    leading-[1.05] tracking-tight max-w-4xl font-headline mb-6">

                Mastering Python Fundamentals
              </h1>

              {/* Subtext (VERY IMPORTANT) */}
              <p className="text-lg md:text-xl text-on-surface-variant dark:text-white/70 max-w-2xl leading-relaxed font-body mb-10">
                This module goes beyond syntax — it builds the mental models required to design scalable, production-grade Python systems.
              </p>

              {/* Meta strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-on-surface-variant dark:text-white/60">

                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-outline-variant/60 dark:border-white/10">
                  Module 01
                </span>

                <span>•</span>

                <span>15 min read</span>

                <span>•</span>

                <span className="text-primary-300 font-semibold">
                  Intermediate Level
                </span>

              </div>
            </header>

            {/* Article sections */}
            <article className="space-y-16 text-[1.15rem] leading-[1.8] text-on-surface-variant dark:text-white/80 font-body">
              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="text-4xl font-bold text-on-surface dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-white/70 tracking-tight pt-4 mb-6 font-headline">
                    {section.title}
                  </h2>
                  <p className="opacity-90">{section.content}</p>

                  {section.highlight && (
                    <div className="my-12 p-10 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-l-4 border-l-accent-400 border border-outline-variant/60 dark:border-white/5 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Icon name="format_quote" className="!text-[120px]" />
                      </div>
                      <h3 className="text-lg font-bold text-accent-600 dark:text-accent-400 mb-4 tracking-widest uppercase relative z-10">{section.highlight.label}</h3>
                      <p className="italic text-on-surface dark:text-white text-2xl font-medium leading-relaxed relative z-10">{section.highlight.quote}</p>
                    </div>
                  )}

                  {section.codeExample && (
                    <div className="my-12 overflow-hidden rounded-[2rem] border border-outline-variant/60 dark:border-white/10 shadow-lg dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                      {/* Mac-style header */}
                      <div className="bg-surface-container-highest dark:bg-[#0f1524] px-6 py-4 flex items-center justify-between border-b border-outline-variant/40 dark:border-white/5">
                        <div className="flex gap-2">
                          {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
                            <div key={c} className="w-3.5 h-3.5 rounded-full" style={{ background: c }} aria-hidden="true" />
                          ))}
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant/80 dark:text-white/40 uppercase tracking-widest">
                          {section.codeExample.filename}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-[#050914] p-8 text-sm leading-loose overflow-x-auto relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                        <pre className="font-mono whitespace-pre text-secondary dark:text-accent-100 relative z-10">{section.codeExample.code}</pre>
                      </div>
                    </div>
                  )}

                  {section.callouts && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
                      {section.callouts.map((c) => (
                        <Card key={c.title} variant="default" hover className="!p-8 group shadow-lg">
                          <div className={`w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-outline-variant/60 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <Icon name={c.icon} className={c.iconColor} size="md" />
                          </div>
                          <h4 className="font-bold text-on-surface dark:text-white text-xl mb-3 font-headline">{c.title}</h4>
                          <p className="text-on-surface-variant dark:text-white/60 text-base">{c.desc}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </article>

            {/* Footer nav */}
            <footer className="mt-24 pt-16 border-t border-outline-variant/60 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                  Next Lesson
                </span>
                <a href="#" className="flex items-center gap-3 text-3xl font-black text-on-surface dark:text-white hover:text-primary-600 dark:hover:text-primary-300 transition-colors mt-2 font-headline group">
                  Variables &amp; Dynamic Typing
                  <Icon name="arrow_forward" size="md" className="group-hover:translate-x-2 transition-transform" />
                </a>
              </div>
              <Button variant="primary" size="lg" icon="check" iconPosition="left" className="px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                Mark Completed
              </Button>
            </footer>
          </div>
        </main>

        {/* Right TOC sidebar — xl+ */}
        <aside className="hidden xl:block w-80 sticky top-[72px] h-[calc(100vh-72px)] p-10 border-l border-outline-variant/60 dark:border-white/10 flex-shrink-0 bg-background/80 lg:bg-background/50 backdrop-blur-3xl">
          <h5 className="text-xs font-black text-on-surface-variant/60 dark:text-white/40 uppercase tracking-widest mb-10">
            On this page
          </h5>
          <nav className="flex flex-col gap-5 relative">
            {/* Rail */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-white/5 rounded-full">
              <div className="absolute top-0 left-0 w-full bg-primary-500 h-16 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
            {tocItems.map((item, i) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className={`pl-8 text-sm transition-all ${i === 0 ? 'text-on-surface dark:text-white font-bold tracking-wide' : 'text-on-surface-variant dark:text-white/50 hover:text-on-surface dark:hover:text-white hover:translate-x-1'}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="mt-16 p-6 bg-accent-50 dark:bg-accent-500/10 rounded-2xl border border-accent-100 dark:border-accent-500/20 backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="lightbulb" className="text-accent-600 dark:text-accent-400" size="sm" filled />
              <span className="text-xs font-bold uppercase tracking-widest text-accent-700 dark:text-accent-300">Pro Tip</span>
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-white/80">
              Python 3.10+ introduced structural pattern matching — a game changer for complex conditional logic!
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
