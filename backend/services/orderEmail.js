const sgMail = require('@sendgrid/mail')

const rwf = (n) => `${Number(n || 0).toLocaleString('en-US')} RWF`
const ref = (order) => `#${String(order._id).slice(-8).toUpperCase()}`

/** Filters empty parts so a missing field never produces a stray comma. */
const formatAddress = (a = {}) =>
    [a.street, a.sector, a.district, a.province].filter(Boolean).join(', ')

/**
 * Fire-and-forget. A failed email must never fail an order that has been paid
 * for, so this resolves even on error and only logs.
 */
async function sendOrderConfirmation(order) {
    try {
        if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
            console.warn('Order email skipped: SendGrid not configured')
            return
        }

        // Configure lazily, never at module scope. This guard ensures env vars
        // are set before we attempt to initialize SendGrid.
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        const rows = order.items.map((i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
          ${i.title}<br><span style="color:#6b7280;font-size:12px;">Paperback · qty ${i.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-size:14px;white-space:nowrap;">
          ${rwf(i.price * i.quantity)}
        </td>
      </tr>`).join('')

        const delivery = order.deliveryMethod === 'collect'
            ? 'Collection in person'
            : `Delivery to ${formatAddress(order.shippingAddress)}`

        await sgMail.send({
            from: { name: 'Bruno Iradukunda', email: process.env.SENDGRID_FROM_EMAIL },
            to: order.customerEmail,
            subject: `Order confirmed — ${ref(order)}`,
            html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#17332C;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#F4F2EC;font-size:20px;">Your order is confirmed</h1>
          <p style="margin:6px 0 0;color:rgba(244,242,236,.7);font-size:13px;">Order ${ref(order)}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Subtotal</td>
                <td style="text-align:right;font-size:14px;">${rwf(order.subtotal)}</td></tr>
            <tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Delivery</td>
                <td style="text-align:right;font-size:14px;">${order.deliveryFee ? rwf(order.deliveryFee) : 'Free'}</td></tr>
            <tr><td style="font-weight:700;padding-top:10px;border-top:1px solid #e5e7eb;">Paid</td>
                <td style="text-align:right;font-weight:700;padding-top:10px;border-top:1px solid #e5e7eb;">${rwf(order.totalAmount)}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.7;">
            ${delivery}<br>We will call ${order.customerPhone} before delivering.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        })
        console.log('Order email sent for', ref(order))
    } catch (err) {
        console.error('Order email failed:', err.message)
    }
}

module.exports = { sendOrderConfirmation, formatAddress }
