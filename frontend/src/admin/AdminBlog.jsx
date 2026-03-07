import { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import toast from 'react-hot-toast'

const categories = ['Faith', 'Forgiveness', 'Personal Growth', 'Rwanda', 'Healing', 'General']

function BlogPostForm({ post, onSave, onCancel }) {
  const isEdit = !!post
  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    content: post?.content ?? '',
    excerpt: post?.excerpt ?? '',
    category: post?.category ?? 'General',
    status: post?.status ?? 'draft',
    readTime: post?.readTime ?? 5,
    tags: post?.tags?.length ? JSON.stringify(post.tags) : '[]',
  })
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('content', form.content)
      fd.append('excerpt', form.excerpt)
      fd.append('category', form.category)
      fd.append('status', form.status)
      fd.append('readTime', String(form.readTime))
      fd.append('tags', form.tags.trim() || '[]')
      if (form.slug) fd.append('slug', form.slug)
      if (coverFile) fd.append('coverImage', coverFile)
      if (isEdit) {
        await adminApi.blog.update(post._id, fd)
        toast.success('Post updated.')
      } else {
        await adminApi.blog.create(fd)
        toast.success('Post created.')
      }
      onSave()
    } catch (err) {
      toast.error(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Slug (optional, auto from title)</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
          placeholder="my-post-url"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Excerpt *</label>
        <textarea
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Content *</label>
        <textarea
          rows={10}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Cover image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-ink-600"
        />
        {isEdit && post?.coverImage && !coverFile && (
          <img src={post.coverImage} alt="" className="mt-2 w-32 h-auto rounded" />
        )}
      </div>
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="px-4 py-2 rounded-lg border border-ink-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 rounded-lg border border-ink-200"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Read time (min)</label>
          <input
            type="number"
            min="1"
            value={form.readTime}
            onChange={(e) => setForm((f) => ({ ...f, readTime: parseInt(e.target.value, 10) || 5 }))}
            className="w-20 px-4 py-2 rounded-lg border border-ink-200"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Tags (JSON array)</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200 font-mono text-sm"
          placeholder='["faith","forgiveness"]'
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update post' : 'Create post'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchPosts = () => {
    adminApi.blog.getAll().then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return
    try {
      await adminApi.blog.delete(id)
      toast.success('Post deleted.')
      fetchPosts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-ink-900">Blog</h1>
        <button
          type="button"
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          Add post
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-ink-100">
          <h2 className="font-serif text-lg text-ink-900 mb-4">{editing ? 'Edit post' : 'New post'}</h2>
          <BlogPostForm
            post={editing}
            onSave={() => { setShowForm(false); setEditing(null); fetchPosts(); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-ink-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-ink-500">No posts yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-ink-50 border-b border-ink-100">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Title</th>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-ink-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="border-b border-ink-50">
                  <td className="py-3 px-4 font-medium text-ink-900">{p.title}</td>
                  <td className="py-3 px-4 text-ink-600">{p.category}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-sm ${p.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-ink-100 text-ink-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => { setEditing(p); setShowForm(true); }}
                      className="text-brand-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
