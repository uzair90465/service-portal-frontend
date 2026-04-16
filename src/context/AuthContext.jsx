import React, { createContext, useContext, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      const token = localStorage.getItem('token')
      if (stored && token) {
        return JSON.parse(stored)
      }
      return null
    } catch {
      return null
    }
  })

  const login = async (email, password) => {
    const res = await axiosInstance.post('/Auth/login', { email, password })
    const data = res.data

    const user = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('currentUser', JSON.stringify(user))
    setCurrentUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)