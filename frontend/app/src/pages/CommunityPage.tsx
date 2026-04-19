import Card from '@components/ui/Card'
import Badge from '@components/ui/Badge'
import Icon from '@components/ui/Icon'
import PostInput from '@components/ui/PostInput '

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LEADERBOARD = [
  { rank: 1, name: 'Priya M.',   score: 4820, streak: 42, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'   },
  { rank: 2, name: 'Alex K.',    score: 4510, streak: 38, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'    },
  { rank: 3, name: 'Zen L.',     score: 4230, streak: 35, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zen'     },
  { rank: 4, name: 'Sam R.',     score: 3980, streak: 29, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam'     },
  { rank: 5, name: 'Jordan T.', score: 3750, streak: 22, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'  },
]

const POSTS = [
  {
    id: 'p1',
    author: 'Priya M.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    timeAgo: '2h ago',
    tag: 'Discussion',
    title: 'Tips for nailing System Design interviews at scale?',
    preview: "I have a loop interview at Amazon next week. Anyone who's been through it - what topics came up most?",
    likes: 24,
    replies: 11,
  },
  {
    id: 'p2',
    author: 'Marcus D.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    timeAgo: '5h ago',
    tag: 'Resource',
    title: 'Best free resources for LeetCode-style problems',
    preview: "Here's a curated list of my favourite free resources after 6 months of grinding...",
    likes: 52,
    replies: 19,
  },
  {
    id: 'p3',
    author: 'Fatima N.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    timeAgo: '1d ago',
    tag: 'Success Story',
    title: "I got the Google offer! Here's what worked for me",
    preview: 'After 3 months of daily practice on PrepMate, I finally received my offer letter this morning…',
    likes: 138,
    replies: 47,
  },
]

const RANK_COLORS = ['text-yellow-500', 'text-slate-400 dark:text-slate-300', 'text-orange-500']
const RANK_BG    = ['bg-yellow-50 dark:bg-yellow-500/10', 'bg-slate-50 dark:bg-slate-500/10', 'bg-orange-50 dark:bg-orange-500/10']

export default function CommunityPage() {
  return (
    <>
      <header className="mb-10">
        <h1 className="text-3xl font-black font-headline text-on-surface dark:text-white tracking-tight">
          Community
        </h1>
        <p className="text-on-surface-variant dark:text-white/60 mt-1 text-sm">
          Connect, learn, and celebrate wins with fellow learners.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
        {/* Feed */}
        <div className="lg:col-span-2 flex flex-col gap-5">
        {/* New post placeholder */}
          <PostInput />
          {POSTS.map((post) => (
            <Card key={post.id} hover>
              <div className="flex items-start gap-4">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-white/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm font-bold text-on-surface dark:text-white">{post.author}</span>
                    <span className="text-xs text-on-surface-variant dark:text-white/40">{post.timeAgo}</span>
                    <Badge label={post.tag} variant="neutral" className="ml-auto text-xs" />
                  </div>
                  <h3 className="font-bold text-on-surface dark:text-white mb-1 leading-snug">{post.title}</h3>
                  <p className="text-sm text-on-surface-variant dark:text-white/60 leading-relaxed line-clamp-2">{post.preview}</p>
                  <div className="flex items-center gap-5 mt-4 text-sm text-on-surface-variant dark:text-white/50">
                    <button className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <Icon name="favorite_border" size="sm" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <Icon name="chat_bubble_outline" size="sm" />
                      <span>{post.replies}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-auto">
                      <Icon name="share" size="sm" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          
        </div>

        {/* Sidebar: Leaderboard */}
        <div>
          <Card variant="elevated">
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-6 flex items-center gap-2">
              <Icon name="leaderboard" size="sm" className="text-accent-500" />
              Weekly Leaderboard
            </h2>
            <div className="space-y-3">
              {LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={[
                    'flex items-center gap-3 p-3 rounded-xl transition-colors',
                    entry.rank <= 3 ? RANK_BG[entry.rank - 1] : 'hover:bg-slate-50 dark:hover:bg-white/5',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-6 text-center font-black text-sm',
                      entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : 'text-on-surface-variant dark:text-white/40',
                    ].join(' ')}
                  >
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface dark:text-white truncate">{entry.name}</p>
                    <p className="text-xs text-on-surface-variant dark:text-white/40 flex items-center gap-1">
                      <Icon name="local_fire_department" size="sm" className="text-orange-500 !text-[14px]" />
                      {entry.streak}d streak
                    </p>
                  </div>
                  <span className="text-sm font-black text-primary-600 dark:text-primary-400 tabular-nums">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
