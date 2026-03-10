import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'

export default function AdminProfile() {
  const { admin, updateProfile } = useAdmin()
  const [formData, setFormData] = useState({
    username: admin?.username || '',
    email: admin?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [passwordMode, setPasswordMode] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      // Validate password change if user is trying to change password
      if (passwordMode) {
        if (!formData.currentPassword) {
          setError('Current password is required')
          setLoading(false)
          return
        }
        if (!formData.newPassword) {
          setError('New password is required')
          setLoading(false)
          return
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match')
          setLoading(false)
          return
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters')
          setLoading(false)
          return
        }
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
      }

      if (passwordMode && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      await updateProfile(updateData)
      setSuccess('Profile updated successfully!')
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordMode(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl w-full min-w-0">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold text-ink-900 mb-1.5 sm:mb-2 break-words">Profile Settings</h1>
      <p className="text-ink-600 text-sm sm:text-base mb-4 sm:mb-6 md:mb-8">Manage your account information and password</p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-ink-100 p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Account Information Section */}
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-ink-900 mb-3 sm:mb-4 pb-2 border-b border-ink-100">
              Account Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-ink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-w-0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-ink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink-100">
              <h2 className="text-xl font-semibold text-ink-900">
                Password
              </h2>
              {!passwordMode && (
                <button
                  type="button"
                  onClick={() => setPasswordMode(true)}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Change Password
                </button>
              )}
            </div>

            {passwordMode ? (
              <div className="space-y-4 bg-ink-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-ink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-ink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-ink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPasswordMode(false)
                    setFormData({
                      ...formData,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                    setError('')
                  }}
                  className="text-sm text-ink-600 hover:text-ink-800"
                >
                  Cancel password change
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink-500">
                ••••••••
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info Display */}
      <div className="mt-6 bg-ink-50 rounded-lg p-4 border border-ink-200">
        <h3 className="text-sm font-medium text-ink-700 mb-2">Account Details</h3>
        <div className="text-sm text-ink-600 space-y-1">
          <p><span className="font-medium">User ID:</span> {admin?._id}</p>
          <p><span className="font-medium">Created:</span> {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p><span className="font-medium">Last Updated:</span> {admin?.updatedAt ? new Date(admin.updatedAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
