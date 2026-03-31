const Contact = require('../models/Contact')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// POST submit contact form
const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const contact = new Contact({ name, email, subject, message })
        await contact.save()

        // Respond immediately so the user is not waiting on email delivery
        res.status(201).json({ message: 'Message sent successfully' })

        // Send email notification in the background
        try {
            console.log('Attempting email — FROM:', process.env.SENDGRID_FROM_EMAIL, 'TO:', process.env.NOTIFY_EMAIL, 'API_KEY set:', !!process.env.SENDGRID_API_KEY)
            const recipientEmail = process.env.NOTIFY_EMAIL || process.env.EMAIL_USER
            await sgMail.send({
                from: { name: "Bruno's Website", email: process.env.SENDGRID_FROM_EMAIL },
                to: recipientEmail,
                replyTo: email,
                subject: `New Message: ${subject}`,
                html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a2e35,#2e949c);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.5px;">
              Bruno Iradukunda
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
              New message from your website
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Hi Bruno, someone just sent you a message through your website. Here are the details:
            </p>

            <!-- Sender info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:4px 0;margin-bottom:24px;">
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">From</span><br>
                  <span style="color:#111827;font-size:15px;font-weight:600;">${name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                  <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br>
                  <a href="mailto:${email}" style="color:#2e949c;font-size:15px;text-decoration:none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;">
                  <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Subject</span><br>
                  <span style="color:#111827;font-size:15px;">${subject}</span>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <p style="margin:0 0 10px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
            <div style="background:#f0fdf9;border-left:4px solid #2e949c;border-radius:4px;padding:20px 24px;color:#1f2937;font-size:15px;line-height:1.8;white-space:pre-wrap;">
${message}
            </div>

            <!-- Reply CTA -->
            <div style="text-align:center;margin-top:32px;">
              <a href="mailto:${email}?subject=Re: ${subject.replace(/"/g, '&quot;')}"
                 style="display:inline-block;background:#2e949c;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                Reply to ${name}
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              This message was sent through the contact form on <strong>brunoiradukunda.com</strong>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
                `,
            })
            console.log('Email sent successfully')
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message, emailErr.code, emailErr.responseCode, emailErr.response)
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET all messages (admin)
const getMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 })
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH mark as read/unread (admin)
const toggleRead = async (req, res) => {
    try {
        const message = await Contact.findById(req.params.id)
        if (!message) return res.status(404).json({ message: 'Message not found' })

        message.read = !message.read
        await message.save()
        res.json(message)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE message (admin)
const deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id)
        if (!message) return res.status(404).json({ message: 'Message not found' })
        res.json({ message: 'Message deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { submitContact, getMessages, toggleRead, deleteMessage }
