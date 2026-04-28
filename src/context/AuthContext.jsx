import React, { createContext, useContext, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('currentUser')
      const token = sessionStorage.getItem('token')
      if (!stored || !token) return null
      return JSON.parse(stored)
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
    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('currentUser', JSON.stringify(user))
    setCurrentUser(user)
    return user
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)