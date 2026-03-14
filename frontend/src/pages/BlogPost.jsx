import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { blogApi, blogInteractionApi } from '../lib/api'
import { useUser } from '../context/UserContext'
import toast from 'react-hot-toast'

// ── Share bar ────────────────────────────────────────────────────────────────
function ShareBar({ title }) {
  const url = window.location.href

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }) } catch (_) {}
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share
    </button>
  )
}

// ── Like button ──────────────────────────────────────────────────────────────
function LikeButton({ postId, initialCount, initialLiked, isLoggedIn }) {
  const navigate = useNavigate()
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!isLoggedIn) { toast.error('Please log in to like posts'); navigate('/login'); return }
    if (loading) return
    setLoading(true)
    try {
      const res = await blogInteractionApi.toggleLike(postId)
      setCount(res.likes)
      setLiked(res.liked)
    } catch {
      toast.error('Could not update like')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'border-ink-200 text-ink-600 hover:bg-ink-50'
      }`}
    >
      <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {count} {count === 1 ? 'Like' : 'Likes'}
    </button>
  )
}

// ── Single comment with replies ──────────────────────────────────────────────
function CommentItem({ comment, postId, isLoggedIn, userId, onDelete, onReplyAdded, onReplyDeleted }) {
  const navigate = useNavigate()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitReply = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { toast.error('Please log in to reply'); navigate('/login'); return }
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const reply = await blogInteractionApi.addReply(postId, comment._id, replyText.trim())
      onReplyAdded(comment._id, reply)
      setReplyText('')
      setShowReplyForm(false)
    } catch (err) {
      toast.error(err.message || 'Could not post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const removeReply = async (replyId) => {
    try {
      await blogInteractionApi.deleteReply(postId, comment._id, replyId)
      onReplyDeleted(comment._id, replyId)
      toast.success('Reply deleted')
    } catch {
      toast.error('Could not delete reply')
    }
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-700 font-semibold text-sm">
        {comment.userName?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-ink-900 text-sm">{comment.userName}</span>
          <span className="text-ink-400 text-xs">
            {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <div className="ml-auto flex gap-3">
            <button type="button" onClick={() => { if (!isLoggedIn) { toast.error('Please log in to reply'); navigate('/login'); return } setShowReplyForm((v) => !v) }} className="text-xs text-brand-600 hover:underline">
              Reply
            </button>
            {userId && (comment.userId === userId || comment.userId?._id === userId) && (
              <button type="button" onClick={() => onDelete(comment._id)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="text-ink-700 text-sm whitespace-pre-wrap break-words">{comment.content}</p>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-ink-100">
            {comment.replies.map((r) => (
              <div key={r._id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0 text-ink-600 font-semibold text-xs">
                  {r.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-medium text-ink-900 text-xs">{r.userName}</span>
                    <span className="text-ink-400 text-xs">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {userId && (r.userId === userId || r.userId?._id === userId) && (
                      <button type="button" onClick={() => removeReply(r._id)} className="ml-auto text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-ink-700 text-xs whitespace-pre-wrap break-words">{r.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={submitReply} className="mt-3 pl-4 border-l-2 border-brand-100">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder={`Reply to ${comment.userName}…`}
              className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm resize-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex gap-2 mt-1 justify-end">
              <button type="button" onClick={() => { setShowReplyForm(false); setReplyText('') }} className="text-xs text-ink-500 hover:underline px-2 py-1">
                Cancel
              </button>
              <button type="submit" disabled={submitting || !replyText.trim()} className="btn-primary text-xs px-3 py-1 disabled:opacity-50">
                {submitting ? 'Posting…' : 'Post reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Comments section ─────────────────────────────────────────────────────────
function CommentsSection({ postId, initialComments, isLoggedIn, userId }) {
  const navigate = useNavigate()
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { toast.error('Please log in to comment'); navigate('/login'); return }
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const comment = await blogInteractionApi.addComment(postId, text.trim())
      setComments((prev) => [...prev, { ...comment, replies: [] }])
      setText('')
    } catch (err) {
      toast.error(err.message || 'Could not post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (commentId) => {
    try {
      await blogInteractionApi.deleteComment(postId, commentId)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
      toast.success('Comment deleted')
    } catch {
      toast.error('Could not delete comment')
    }
  }

  const handleReplyAdded = (commentId, reply) => {
    setComments((prev) =>
      prev.map((c) => c._id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c)
    )
  }

  const handleReplyDeleted = (commentId, replyId) => {
    setComments((prev) =>
      prev.map((c) => c._id === commentId ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) } : c)
    )
  }

  return (
    <section className="mt-12 pt-8 border-t border-ink-100">
      <h2 className="font-serif text-xl text-ink-900 mb-6">Comments ({comments.length})</h2>

      {/* Comment form */}
      {isLoggedIn ? (
        <form onSubmit={submit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Write a comment…"
            className="w-full px-4 py-3 rounded-lg border border-ink-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-ink-400">{text.length}/1000</span>
            <button type="submit" disabled={submitting || !text.trim()} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-8 text-sm text-ink-500">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link> to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-ink-400 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postId={postId}
              isLoggedIn={isLoggedIn}
              userId={userId}
              onDelete={remove}
              onReplyAdded={handleReplyAdded}
              onReplyDeleted={handleReplyDeleted}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams()
  const { user } = useUser()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    blogApi
      .getBySlug(slug)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="py-16 max-w-3xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ink-100 rounded w-3/4" />
          <div className="h-4 bg-ink-100 rounded w-1/3" />
          <div className="h-64 bg-ink-100 rounded" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-600">{error || 'Post not found.'}</p>
        <Link to="/blog" className="text-brand-600 font-medium mt-2 inline-block hover:underline">Back to Blog</Link>
      </div>
    )
  }

  const isLoggedIn = !!user
  const userId = user?._id
  const likeCount = post.likes?.length ?? 0
  const userLiked = isLoggedIn && post.likes?.some((id) => id === userId || id?._id === userId)

  return (
    <article className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/blog" className="text-brand-600 font-medium hover:underline mb-8 inline-block">
          ← Back to Blog
        </Link>

        <header className="mb-8">
          <span className="text-brand-600 font-medium">{post.category}</span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink-900 mt-1 mb-4">{post.title}</h1>
          {post.readTime && <p className="text-ink-500 text-sm">{post.readTime} min read</p>}
        </header>

        {post.coverImage && (
          <img src={post.coverImage} alt="" className="w-full rounded-xl shadow-lg mb-10 object-cover max-h-96" />
        )}

        {/* Content — TipTap outputs proper HTML, render as-is */}
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-brand-600 prose-img:rounded-lg [&_table]:border-collapse [&_td]:border [&_td]:border-ink-300 [&_td]:p-2 [&_th]:border [&_th]:border-ink-300 [&_th]:p-2 [&_th]:bg-ink-50"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Like & Share bar */}
        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-ink-100">
          <LikeButton
            postId={post._id}
            initialCount={likeCount}
            initialLiked={userLiked}
            isLoggedIn={isLoggedIn}
          />
          <ShareBar title={post.title} />
        </div>

        {/* Comments */}
        <CommentsSection
          postId={post._id}
          initialComments={post.comments ?? []}
          isLoggedIn={isLoggedIn}
          userId={userId}
        />
      </div>
    </article>
  )
}
