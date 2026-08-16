import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { AuthContext } from './authContext.js'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('fds_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('fds_token')))

  useEffect(() => {
    const token = localStorage.getItem('fds_token')
    if (!token) return

    let active = true
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!active) return
        setUser(data.user)
        localStorage.setItem('fds_user', JSON.stringify(data.user))
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        localStorage.removeItem('fds_user')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('fds_token', data.token)
    localStorage.setItem('fds_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    localStorage.setItem('fds_token', data.token)
    localStorage.setItem('fds_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fds_token')
    localStorage.removeItem('fds_user')
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
