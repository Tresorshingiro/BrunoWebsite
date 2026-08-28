const Flutterwave = require('flutterwave-node-v3')

/* Built on first use, never at import.
   The SDK constructor throws "Public Key required" when the keys are absent, so
   constructing at module scope made the whole route tree — and therefore the
   server — impossible to require without Flutterwave configured. That turned a
   missing-config problem into an opaque stack trace at boot. */
let client = null

function flw() {
    if (!client) {
        if (!process.env.FLW_PUBLIC_KEY || !process.env.FLW_SECRET_KEY) {
            throw new Error(
                'Flutterwave is not configured: set FLW_PUBLIC_KEY and FLW_SECRET_KEY'
            )
        }
        client = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)
    }
    return client
}

/** Our own reference, generated before payment so verification has an anchor. */
function genTxRef() {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
    return `BRUNO-${Date.now()}-${rand}`
}

/**
 * Ask Flutterwave what actually happened. Returns their `data` object.
 * Throws if the call fails or returns no data — callers must treat any throw
 * as "not paid".
 */
async function verifyTransaction(transactionId) {
    const res = await flw().Transaction.verify({ id: String(transactionId) })
    if (!res || !res.data) {
        throw new Error('Flutterwave returned no transaction data')
    }
    return res.data
}

module.exports = { flw, genTxRef, verifyTransaction }
