import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { adminApi, blogInteractionApi } from '../lib/api'
import toast from 'react-hot-toast'

const categories = ['Faith', 'Forgiveness', 'Personal Growth', 'Rwanda', 'Healing', 'General']

// ── Toolbar button helper ────────────────────────────────────────────────────
function ToolBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
      }`}
    >
      {children}
    </button>
  )
}

// ── Rich text editor ─────────────────────────────────────────────────────────
function RichTextEditor({ content, onChange }) {
  const imageInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await blogInteractionApi.uploadImage(fd)
      if (res?.url) editor.chain().focus().setImage({ src: res.url }).run()
      else toast.error('Image upload failed')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const setLink = () => {
    const url = window.prompt('URL', editor.getAttributes('link').href || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const insertTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()

  return (
    <div className="border border-ink-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-ink-200 bg-ink-50">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">B</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><u>U</u></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></ToolBtn>
        <div className="w-px bg-ink-200 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolBtn>
        <div className="w-px bg-ink-200 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">1. List</ToolBtn>
        <div className="w-px bg-ink-200 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">"</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">{`</>`}</ToolBtn>
        <div className="w-px bg-ink-200 mx-1" />
        <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Insert link">🔗</ToolBtn>
        <ToolBtn onClick={() => imageInputRef.current?.click()} active={false} title={uploading ? 'Uploading…' : 'Insert image'}>
          {uploading ? '⏳' : '🖼'}
        </ToolBtn>
        <ToolBtn onClick={insertTable} active={false} title="Insert table">⊞ Table</ToolBtn>
        <div className="w-px bg-ink-200 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</ToolBtn>
      </div>

      {/* Hidden file input for image upload */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[320px] p-4 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px] [&_table]:border-collapse [&_td]:border [&_td]:border-ink-300 [&_td]:p-2 [&_th]:border [&_th]:border-ink-300 [&_th]:p-2 [&_th]:bg-ink-50"
      />
    </div>
  )
}

// ── Blog post form ───────────────────────────────────────────────────────────
function BlogPostForm({ post, onSave, onCancel }) {
  const isEdit = !!post
  const [form, setForm] = useState({
    title: post?.title ?? '',
    content: post?.content ?? '',
    category: post?.category ?? 'General',
    status: post?.status ?? 'draft',
    readTime: post?.readTime ?? 5,
  })
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content || form.content === '<p></p>') {
      toast.error('Content cannot be empty.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('content', form.content)
      fd.append('category', form.category)
      fd.append('status', form.status)
      fd.append('readTime', String(form.readTime))
      fd.append('tags', '[]')
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl w-full">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
        />
      </div>

      {/* Content — rich text editor */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Content *</label>
        <RichTextEditor
          content={form.content}
          onChange={(html) => setForm((f) => ({ ...f, content: html }))}
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Cover image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-ink-600"
        />
        {coverFile && (
          <img src={URL.createObjectURL(coverFile)} alt="Preview" className="mt-2 w-32 h-auto rounded border border-ink-200" />
        )}
        {isEdit && post?.coverImage && !coverFile && (
          <img src={post.coverImage} alt="Current" className="mt-2 w-32 h-auto rounded border border-ink-200" />
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-ink-200 text-sm"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-ink-200 text-sm"
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
            className="w-20 px-3 py-2 rounded-lg border border-ink-200 text-sm"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Update post' : 'Create post'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const view = searchParams.get('view')
  const editId = searchParams.get('id')
  const showForm = view === 'add' || view === 'edit'
  const editing = editId ? posts.find((p) => p._id === editId) ?? null : null

  const fetchPosts = () => {
    adminApi.blog.getAll().then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

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
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">
        <h1 className="font-serif text-xl md:text-2xl lg:text-3xl text-ink-900">Blog</h1>
        <button
          type="button"
          onClick={() => navigate('?view=add')}
          className="btn-primary w-full sm:w-auto text-sm px-4 py-2"
        >
          Add post
        </button>
      </div>

      {showForm ? (
        <div className="p-4 md:p-6 bg-white rounded-xl border border-ink-100">
          <h2 className="font-serif text-lg text-ink-900 mb-4">{editing ? 'Edit post' : 'New post'}</h2>
          <BlogPostForm
            post={editing}
            onSave={() => { navigate('/admin/blog'); fetchPosts() }}
            onCancel={() => navigate('/admin/blog')}
          />
        </div>
      ) : loading ? (
        <p className="text-ink-500">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-ink-500">No posts yet.</p>
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {posts.map((p) => (
              <div key={p._id} className="bg-white rounded-xl border border-ink-100 p-4">
                <h3 className="font-semibold text-ink-900 mb-2 break-words">{p.title}</h3>
                <div className="flex flex-wrap gap-2 text-sm mb-3">
                  <span className="px-2 py-1 bg-ink-100 text-ink-600 rounded">{p.category}</span>
                  <span className={`px-2 py-1 rounded ${p.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-ink-100 text-ink-600'}`}>{p.status}</span>
                  <span className="px-2 py-1 bg-red-50 text-red-600 rounded">♥ {p.likesCount ?? 0}</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">💬 {p.commentsCount ?? 0}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => navigate(`?view=edit&id=${p._id}`)} className="flex-1 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-sm font-medium">Edit</button>
                  <button type="button" onClick={() => handleDelete(p._id)} className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-ink-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-ink-700">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-ink-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-ink-700">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-ink-700">Likes</th>
                  <th className="text-center py-3 px-4 font-medium text-ink-700">Comments</th>
                  <th className="text-right py-3 px-4 font-medium text-ink-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id} className="border-b border-ink-50">
                    <td className="py-3 px-4 font-medium text-ink-900">{p.title}</td>
                    <td className="py-3 px-4 text-ink-600">{p.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-sm ${p.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-ink-100 text-ink-600'}`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-red-600">♥ {p.likesCount ?? 0}</td>
                    <td className="py-3 px-4 text-center text-sm text-blue-600">💬 {p.commentsCount ?? 0}</td>
                    <td className="py-3 px-4 text-right">
                      <button type="button" onClick={() => navigate(`?view=edit&id=${p._id}`)} className="text-brand-600 hover:underline mr-3">Edit</button>
                      <button type="button" onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
