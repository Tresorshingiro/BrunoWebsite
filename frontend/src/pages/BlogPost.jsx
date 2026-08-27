import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Heart, Share2, MessageCircle } from 'lucide-react'
import { blogApi, blogInteractionApi } from '../lib/api'
import { cldResize, cldSrcSet } from '../lib/images'
import { useUser } from '../context/UserContext'
import { useReadingProgress } from '../hooks/useMotion'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import toast from 'react-hot-toast'

/* Every post on this site is Bruno's — the BlogPost model carries no author
   field, so this is a constant rather than per-record content. If guest posts
   ever appear, this has to move onto the record before it can be shown. */
const AUTHOR = {
  name: 'Bruno Iradukunda',
  role: 'Author & speaker',
  bio: 'Bruno survived the 1994 Genocide Against the Tutsi. He writes about forgiveness because he had to work out how to do it himself, and because nobody explained it to him at the time.',
  portrait: '/images/bruno-portrait.png',
}

const formatDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

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
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-edge border border-ink-950/[.14] text-ink-600 hover:border-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors"
    >
      <Share2 size={16} />
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
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-edge border text-sm font-semibold transition-colors ${
        liked
          ? 'border-brand-600 bg-brand-500/10 text-brand-700'
          : 'border-ink-950/[.14] text-ink-600 hover:border-brand-600 hover:text-brand-700'
      }`}
    >
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
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
    <div>
      <h2 className="font-serif text-2xl font-semibold text-ink-950 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      {isLoggedIn ? (
        <form onSubmit={submit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Write a comment…"
            className="w-full px-4 py-3 rounded-edge border border-ink-950/[.14] bg-white/60 text-sm focus:outline-none focus:border-brand-600 focus:bg-white resize-none transition-colors"
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
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams()
  const { user } = useUser()
  const { targetRef, barRef } = useReadingProgress()

  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setPost(null)
    blogApi
      .getBySlug(slug)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false))
  }, [slug])

  // Same category first, topped up with whatever else is recent.
  useEffect(() => {
    if (!post) return
    blogApi
      .getPublished({ limit: 8 })
      .then((res) => {
        const others = (res.posts || []).filter((p) => p._id !== post._id)
        const sameCat = others.filter((p) => p.category === post.category)
        const rest = others.filter((p) => p.category !== post.category)
        setRelated([...sameCat, ...rest].slice(0, 3))
      })
      .catch(() => setRelated([]))
  }, [post])

  if (loading) {
    return (
      <div className="bg-ink-950 pt-32 md:pt-44 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="h-4 w-28 bg-ink-800 rounded animate-pulse" />
          <div className="h-12 w-3/4 bg-ink-800 rounded animate-pulse" />
          <div className="h-6 w-1/2 bg-ink-800/70 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="bg-ink-950 text-ink-100 pt-32 md:pt-44 pb-24 text-center">
        <p className="text-ink-100/70">{error || 'Post not found.'}</p>
        <Link to="/blog" className="link-more mt-4 justify-center">
          Back to the blog <ArrowRight size={15} className="arw" />
        </Link>
      </div>
    )
  }

  const date = formatDate(post.createdAt)
  const isLoggedIn = Boolean(user)
  const likeCount = post.likes?.length ?? 0
  const liked = Boolean(user && post.likes?.some((id) => String(id) === String(user.id || user._id)))

  return (
    <div>
      {/* Reading progress — scaleX on a fixed hairline, driven by a CSS var so
          scrolling never re-renders the page. */}
      <div className="post-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      {/* ── HEAD ───────────────────────────────────────────────────────── */}
      <header className="on-dark canvas relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-12 md:pt-44 md:pb-16">
        <div
          aria-hidden="true"
          className="full pointer-events-none absolute"
          style={{
            right: '-18%',
            top: '-38%',
            width: '62vw',
            height: '62vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,70,60,.5) 0%, transparent 62%)',
          }}
        />
        <Link
          to="/blog"
          className="wide relative z-10 inline-flex items-center gap-2 text-sm font-medium text-ink-100/60 hover:text-brand-300 transition-colors mb-9"
        >
          <ArrowLeft size={15} />
          Back to the blog
        </Link>
        <p className="wide relative z-10 text-[.68rem] font-semibold uppercase tracking-[.2em] text-brand-300 mb-4">
          {post.category}
        </p>
        <h1 className="wide relative z-10 font-serif text-4xl md:text-5xl font-semibold leading-[1.07] tracking-tight max-w-[20ch]">
          <ClipWords text={post.title} selfStart />
        </h1>
        {post.excerpt && (
          <p className="wide relative z-10 font-serif italic text-xl text-ink-100/70 leading-relaxed mt-6 max-w-[52ch]">
            {post.excerpt}
          </p>
        )}
        <div className="wide relative z-10 meta-dots mt-8 pt-5 border-t border-ink-100/15">
          <span>
            By <strong className="text-ink-100/85 font-semibold">{AUTHOR.name}</strong>
          </span>
          {date && (
            <>
              <i aria-hidden="true" />
              <span>{date}</span>
            </>
          )}
          <i aria-hidden="true" />
          <span>{post.readTime || 5} min read</span>
        </div>
      </header>

      {/* ── COVER — breaks out to the wide track ───────────────────────── */}
      {post.coverImage && (
        <div className="canvas bg-ink-100 pt-10 md:pt-14">
          <figure className="wide m-0">
            <img
              src={cldResize(post.coverImage, 1000)}
              srcSet={cldSrcSet(post.coverImage, 1000)}
              alt=""
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="w-full rounded-card"
            />
          </figure>
        </div>
      )}

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <article ref={targetRef} className="canvas bg-ink-100 pt-10 md:pt-14 pb-12 md:pb-16">
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        <div className="flex flex-wrap gap-3 items-center mt-12 pt-8 border-t border-ink-950/[.14]">
          <LikeButton
            postId={post._id}
            initialCount={likeCount}
            initialLiked={liked}
            isLoggedIn={isLoggedIn}
          />
          <ShareBar title={post.title} />
          <a
            href="#comments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-edge border border-ink-950/[.14] text-ink-600 hover:border-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors ml-auto"
          >
            <MessageCircle size={16} />
            Comments
          </a>
        </div>
      </article>

      {/* ── AUTHOR ─────────────────────────────────────────────────────── */}
      <section className="canvas bg-ink-50 py-12 md:py-16">
        <Reveal className="wide grid sm:grid-cols-[88px_minmax(0,1fr)] gap-6 items-start">
          <img
            src={AUTHOR.portrait}
            alt=""
            className="w-[88px] h-[88px] rounded-full object-cover object-top bg-ink-200"
            loading="lazy"
          />
          <div>
            <div className="font-serif text-2xl font-semibold text-ink-950">{AUTHOR.name}</div>
            <div className="text-[.72rem] uppercase tracking-[.16em] text-ink-500 mt-1.5">
              {AUTHOR.role}
            </div>
            <p className="text-ink-600 leading-relaxed mt-4">{AUTHOR.bio}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/books" className="btn-primary">
                Read the book <ArrowRight size={15} className="arw" />
              </Link>
              <Link to="/blog" className="btn-secondary">
                More from the blog
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── COMMENTS ───────────────────────────────────────────────────── */}
      <section id="comments" className="canvas bg-ink-100 py-12 md:py-16 scroll-mt-24">
        <div className="wide">
          <CommentsSection
            postId={post._id}
            initialComments={post.comments || []}
            isLoggedIn={isLoggedIn}
            userId={user?.id || user?._id}
          />
        </div>
      </section>

      {/* ── KEEP READING ───────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-ink-50 band">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="mb-8">
              <p className="eyebrow">Keep reading</p>
              <h2 className="section-heading mt-4 mb-0">More from the blog</h2>
            </Reveal>
            <div className="post-rows">
              {related.map((r, i) => (
                <Reveal as="div" key={r._id} delay={i < 3 ? i : undefined}>
                  <Link to={`/blog/${r.slug}`} className="post-row group">
                    <div className="post-media">
                      {r.coverImage && (
                        <img
                          src={cldResize(r.coverImage, 220)}
                          srcSet={cldSrcSet(r.coverImage, 220)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-[.66rem] font-semibold uppercase tracking-[.18em] text-brand-600 mb-1.5">
                        {r.category}
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-ink-950 leading-tight transition-colors group-hover:text-brand-700">
                        {r.title}
                      </h3>
                    </div>
                    <div className="post-row-meta">
                      <span>{r.readTime || 5} min</span>
                      <ArrowRight size={18} className="post-go" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
