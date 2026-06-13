import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (token && savedUser) {
        try {
          const res = await api.get('/auth/me')
          const userData = {
            user_id: res.data.user_id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role
          }
          localStorage.setItem('user', JSON.stringify(userData))
          if (active) setUser(userData)
        } catch (err) {
          console.error(err)
          localStorage.clear()
          if (active) setUser(null)
        }
      }
      if (active) setLoading(false)
    }

    loadUser()

    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)

    const res = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const userData = {
      user_id: res.data.user_id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role
    }

    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
