import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })
const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    await login(loginForm.email, loginForm.password)
    window.location.href = '/'  // navigate ki jagah ye
  } catch (err) {
    setError('Invalid email or password')
    setLoading(false)
  }
}

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await axiosInstance.post('/Auth/register', registerForm)
      setSuccess('Account created! Please sign in.')
      setIsLogin(true)
      setLoginForm({ email: registerForm.email, password: '' })
      setRegisterForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = () => (
    <button type="button" onClick={() => setShowPassword(!showPassword)}
      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
      {showPassword ? (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15,23,42,0.8)',
        border: '1px solid rgba(56,189,248,0.1)',
        borderRadius: '24px',
        padding: '40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56,189,248,0.3)',
            flexShrink: 0
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9' }}>
            Service<span style={{ color: '#38BDF8' }}>Portal</span>
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F1F5F9', marginBottom: '4px' }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '28px' }}>
          {isLogin ? 'Sign in to your account to continue' : 'Fill in the details to get started'}
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', padding: '12px 16px', borderRadius: '12px',
            fontSize: '13px', marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
            color: '#34D399', padding: '12px 16px', borderRadius: '12px',
            fontSize: '13px', marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                Email Address
              </label>
              <input type="email" required placeholder="you@example.com"
                style={{
                  width: '100%', background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px',
                  padding: '12px 16px', color: '#F1F5F9', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#38BDF8'}
                onBlur={e => e.target.style.borderColor = 'rgba(56,189,248,0.15)'}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required placeholder="Enter your password"
                  style={{
                    width: '100%', background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px',
                    padding: '12px 44px 12px 16px', color: '#F1F5F9', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#38BDF8'}
                  onBlur={e => e.target.style.borderColor = 'rgba(56,189,248,0.15)'}
                />
                <EyeIcon />
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
                border: 'none', borderRadius: '12px', padding: '13px',
                color: 'white', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(56,189,248,0.25)',
                transition: 'all 0.2s'
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {!isLogin && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                Full Name
              </label>
              <input type="text" required placeholder="Your full name"
                style={{
                  width: '100%', background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px',
                  padding: '12px 16px', color: '#F1F5F9', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box'
                }}
                value={registerForm.name}
                onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#38BDF8'}
                onBlur={e => e.target.style.borderColor = 'rgba(56,189,248,0.15)'}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                Email Address
              </label>
              <input type="email" required placeholder="you@example.com"
                style={{
                  width: '100%', background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px',
                  padding: '12px 16px', color: '#F1F5F9', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box'
                }}
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#38BDF8'}
                onBlur={e => e.target.style.borderColor = 'rgba(56,189,248,0.15)'}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required placeholder="Create a strong password"
                  style={{
                    width: '100%', background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px',
                    padding: '12px 44px 12px 16px', color: '#F1F5F9', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#38BDF8'}
                  onBlur={e => e.target.style.borderColor = 'rgba(56,189,248,0.15)'}
                />
                <EyeIcon />
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
                border: 'none', borderRadius: '12px', padding: '13px',
                color: 'white', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(56,189,248,0.25)'
              }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Switch */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#475569' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: '#38BDF8', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </div>

      </div>
    </div>
  )
}