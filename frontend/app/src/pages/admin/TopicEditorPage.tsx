import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminShell from '@components/layout/AdminShell'
import Button from '@components/ui/Button'
import Icon from '@components/ui/Icon'

const initialState = {
  name: '',
  slug: '',
  description: '',
  icon: 'category',
  order: 1,
  published: false,
  color: '#0053db',
}

const iconOptions = ['category', 'account_tree', 'terminal', 'hub', 'database', 'psychology', 'coffee', 'bolt']

export default function TopicEditorPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <button
            onClick={() => navigate('/admin/topics')}
            className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2 hover:text-on-surface transition-colors"
          >
            <Icon name="arrow_back" size="xs" />
            Back to Topics
          </button>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline">Topic Editor</h2>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button variant="primary" size="sm" icon="save" iconPosition="left">
            {form.published ? 'Publish' : 'Save Draft'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Topic Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full p-4 bg-surface-container-low border-none rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Slug (auto-generated)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm font-mono">/topics/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full pl-[5.5rem] pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Describe what learners will gain from this topic..."
                className="w-full p-4 bg-surface-container-low border-none rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              />
            </div>
          </div>

          {/* Icon picker */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Topic Icon</label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    form.icon === icon
                      ? 'bg-primary text-white shadow-md scale-110'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  aria-label={icon}
                  aria-pressed={form.icon === icon}
                >
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold">Status</h3>
            <div
              className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl cursor-pointer"
              onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
            >
              <div>
                <p className="font-semibold text-sm">{form.published ? 'Published' : 'Draft'}</p>
                <p className="text-xs text-on-surface-variant">{form.published ? 'Visible to learners' : 'Not visible yet'}</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${form.published ? 'bg-secondary' : 'bg-outline-variant'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.published ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold">Display Order</h3>
            <input
              type="number"
              value={form.order}
              min={1}
              onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 1 }))}
              className="w-full p-3 bg-surface-container-low border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-on-surface-variant">Lower number displays first in the curriculum.</p>
          </div>

          {/* Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-sm text-on-surface-variant uppercase tracking-widest">Card Preview</h3>
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon name={form.icon} className="text-primary" size="sm" />
              </div>
              <h4 className="font-bold text-on-surface mb-1">{form.name || 'Topic Name'}</h4>
              <p className="text-xs text-on-surface-variant line-clamp-2">{form.description || 'Description will appear here...'}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
