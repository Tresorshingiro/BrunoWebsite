import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '../context/UserContext'
import { PROVINCES, districtsFor } from '../lib/rwanda'
import AccountNav from '../components/order/AccountNav'

export default function Profile() {
  const { user, updateProfile } = useUser()
  const [form, setForm] = useState({
    name: '', phone: '', province: 'Kigali City', district: 'Gasabo', sector: '', street: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      province: user.address?.province || 'Kigali City',
      district: user.address?.district || 'Gasabo',
      sector: user.address?.sector || '',
      street: user.address?.street || '',
    })
  }, [user])

  const set = (k) => (e) => {
    const v = e.target.value
    setForm((f) => (k === 'province'
      ? { ...f, province: v, district: districtsFor(v)[0] || '' }
      : { ...f, [k]: v }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: {
          province: form.province, district: form.district,
          sector: form.sector.trim(), street: form.street.trim(),
        },
      })
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32 pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-3xl md:text-5xl">Profile</h1>
          <p className="text-ink-100/65 mt-3">Saved here, filled in for you at checkout.</p>
          <AccountNav current="profile" />
        </div>
      </header>

      <main className="bg-ink-100 band">
        <form onSubmit={save} className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7 mb-5">
            <h2 className="font-serif text-xl text-ink-900 mb-5">You</h2>
            <div className="fld-pair">
              <div className="fld">
                <label htmlFor="name">Full name</label>
                <input id="name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="fld">
                <label htmlFor="email">Email</label>
                <input id="email" value={user?.email || ''} disabled />
                <p className="fld-hint">Your email cannot be changed here.</p>
              </div>
            </div>
            <div className="fld !mb-0">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" value={form.phone} onChange={set('phone')}
                     placeholder="+250 7•• ••• •••" />
              <p className="fld-hint">Used by the courier when a delivery is on its way.</p>
            </div>
          </div>

          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
            <h2 className="font-serif text-xl text-ink-900 mb-5">Delivery address</h2>
            <div className="fld-pair">
              <div className="fld">
                <label htmlFor="province">Province / City</label>
                <select id="province" value={form.province} onChange={set('province')}>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="district">District</label>
                <select id="district" value={form.district} onChange={set('district')}>
                  {districtsFor(form.province).map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="fld-pair">
              <div className="fld !mb-0">
                <label htmlFor="sector">Sector</label>
                <input id="sector" value={form.sector} onChange={set('sector')} placeholder="Gikondo" />
              </div>
              <div className="fld !mb-0">
                <label htmlFor="street">Street or landmark</label>
                <input id="street" value={form.street} onChange={set('street')}
                       placeholder="KK 15 Ave, near SP filling station" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary mt-6 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </main>
    </>
  )
}
