import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      setLoading(false)
      return
    }
    
    // Verify token by fetching user data
    api.get('/api/users/me')
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('userToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const register = async (name, email, password) => {
    const response = await api.post('/api/users/register', { name, email, password })
    localStorage.setItem('userToken', response.token)
    setUser(response.user)
    return response.user
  }

  const login = async (email, password) => {
    const response = await api.post('/api/users/login', { email, password })
    localStorage.setItem('userToken', response.token)
    setUser(response.user)
    return response.user
  }

  const logout = () => {
    localStorage.removeItem('userToken')
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    const response = await api.put('/api/users/profile', profileData)
    setUser(response)
    return response
  }

  return (
    <UserContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
