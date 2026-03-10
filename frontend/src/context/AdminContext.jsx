import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../lib/api'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => setAdmin(data))
      .catch(() => {
        localStorage.removeItem('adminToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { token, admin: a } = await authApi.login(email, password)
    localStorage.setItem('adminToken', token)
    setAdmin(a)
    return a
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setAdmin(null)
  }

  const updateProfile = async (data) => {
    const updatedAdmin = await authApi.updateProfile(data)
    setAdmin(updatedAdmin)
    return updatedAdmin
  }

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, updateProfile }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
