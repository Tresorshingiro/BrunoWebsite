const Subscriber = require('../models/Subscriber')
const nodemailer = require('nodemailer')
const dns = require('dns')

// Force IPv4 DNS resolution — Render's IPv6 route to Gmail SMTP is unreachable
const ipv4Lookup = (hostname, options, cb) => {
    dns.resolve4(hostname, (err, addresses) => {
        if (err) return cb(err)
        cb(null, addresses[0], 4)
    })
}

const createTransporter = () =>
    nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        lookup: ipv4Lookup,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS.replace(/\s/g, '') },
    })

// POST /api/subscriptions — subscribe
const subscribe = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ message: 'Email is required' })

        const existing = await Subscriber.findOne({ email })
        if (existing) {
            if (existing.isActive) {
                return res.status(400).json({ message: 'This email is already subscribed' })
            }
            existing.isActive = true
            await existing.save()
            return res.json({ message: 'Welcome back! You are now re-subscribed.' })
        }

        const subscriber = new Subscriber({ email })
        await subscriber.save()

        // Send welcome email (fire and forget)
        const frontendUrl = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '')
        const unsubUrl = `${frontendUrl}/unsubscribe?token=${subscriber.unsubscribeToken}`

        createTransporter().sendMail({
            from: `"Bruno Iradukunda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "You're subscribed to Bruno's Blog!",
            html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a2e35,#2e949c);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Bruno Iradukunda</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Blog Subscription Confirmed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;text-align:center;">
            <div style="width:64px;height:64px;background:#e6f7f8;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:28px;">✅</span>
            </div>
            <h2 style="margin:0 0 12px;color:#111827;font-size:20px;">You're all set!</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7;">
              Thank you for subscribing. You will receive an email whenever Bruno publishes a new blog post on faith, forgiveness, healing, and purposeful living.
            </p>
            <a href="${frontendUrl}/blog" style="display:inline-block;background:#2e949c;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              Read the Blog
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              Don't want these emails? <a href="${unsubUrl}" style="color:#2e949c;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>
            `,
        }).catch((err) => console.error('Welcome email failed:', err.message))

        res.status(201).json({ message: 'Successfully subscribed!' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/subscriptions/unsubscribe?token=xxx
const unsubscribe = async (req, res) => {
    try {
        const { token } = req.query
        if (!token) return res.status(400).json({ message: 'Invalid unsubscribe link' })

        const subscriber = await Subscriber.findOne({ unsubscribeToken: token })
        if (!subscriber) return res.status(404).json({ message: 'Subscription not found' })

        subscriber.isActive = false
        await subscriber.save()

        res.json({ message: 'You have been unsubscribed successfully.' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Called from blogController when a post is published — notify all active subscribers
const notifySubscribers = async (post) => {
    try {
        const subscribers = await Subscriber.find({ isActive: true })
        if (!subscribers.length) return

        const frontendUrl = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '')
        const postUrl = `${frontendUrl}/blog/${post.slug}`
        const transporter = createTransporter()

        for (const sub of subscribers) {
            const unsubUrl = `${frontendUrl}/unsubscribe?token=${sub.unsubscribeToken}`
            await transporter.sendMail({
                from: `"Bruno Iradukunda" <${process.env.EMAIL_USER}>`,
                to: sub.email,
                subject: `New Post: ${post.title}`,
                html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a2e35,#2e949c);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Bruno Iradukunda</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">New Blog Post</p>
          </td>
        </tr>
        ${post.coverImage ? `
        <tr>
          <td style="padding:0;">
            <img src="${post.coverImage}" alt="" width="580" style="display:block;width:100%;max-height:260px;object-fit:cover;">
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding:36px 40px;">
            ${post.category ? `<p style="margin:0 0 8px;color:#2e949c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${post.category}</p>` : ''}
            <h2 style="margin:0 0 16px;color:#111827;font-size:22px;line-height:1.4;">${post.title}</h2>
            ${post.excerpt ? `<p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.7;">${post.excerpt}</p>` : ''}
            <a href="${postUrl}" style="display:inline-block;background:#2e949c;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              Read the Full Post →
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              You are receiving this because you subscribed to Bruno's blog.
              <a href="${unsubUrl}" style="color:#2e949c;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>
                `,
            })
        }
    } catch (err) {
        console.error('Subscriber notification failed:', err.message)
    }
}

module.exports = { subscribe, unsubscribe, notifySubscribers }
