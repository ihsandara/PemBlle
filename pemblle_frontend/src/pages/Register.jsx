import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Register() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        password: ''
    })
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)

    // Validation rules
    const validateFullName = (name) => {
        const trimmed = name.trim()
        // Must be 2-50 characters
        if (trimmed.length < 2) return t('name_too_short') || 'Name must be at least 2 characters'
        if (trimmed.length > 50) return t('name_too_long') || 'Name must be less than 50 characters'
        // Must contain only letters, spaces, hyphens, apostrophes (for names like O'Brien, Mary-Jane)
        const nameRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\-']+$/
        if (!nameRegex.test(trimmed)) return t('name_invalid') || 'Name can only contain letters, spaces, hyphens and apostrophes'
        // Must have at least one letter
        if (!/[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(trimmed)) return t('name_invalid') || 'Name must contain letters'
        return null
    }

    const validateUsername = (username) => {
        const trimmed = username.trim()
        if (trimmed.length < 3) return t('username_too_short') || 'Username must be at least 3 characters'
        if (trimmed.length > 20) return t('username_too_long') || 'Username must be less than 20 characters'
        // Only lowercase letters, numbers, underscores
        if (!/^[a-z0-9_]+$/.test(trimmed)) return t('username_invalid') || 'Username can only contain lowercase letters, numbers and underscores'
        return null
    }

    const validatePassword = (password) => {
        if (password.length < 6) return t('password_too_short') || 'Password must be at least 6 characters'
        if (password.length > 100) return t('password_too_long') || 'Password is too long'
        return null
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return t('email_invalid') || 'Please enter a valid email'
        return null
    }

    const handleFieldChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
        
        // Clear error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors({ ...fieldErrors, [field]: null })
        }
    }

    const handleFieldBlur = (field) => {
        let error = null
        switch (field) {
            case 'full_name':
                error = validateFullName(formData.full_name)
                break
            case 'username':
                error = validateUsername(formData.username)
                break
            case 'email':
                error = validateEmail(formData.email)
                break
            case 'password':
                error = validatePassword(formData.password)
                break
        }
        if (error) {
            setFieldErrors({ ...fieldErrors, [field]: error })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        // Validate all fields
        const errors = {
            full_name: validateFullName(formData.full_name),
            username: validateUsername(formData.username),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password)
        }
        
        const hasErrors = Object.values(errors).some(e => e !== null)
        if (hasErrors) {
            setFieldErrors(errors)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    full_name: formData.full_name.trim(),
                    username: formData.username.trim().toLowerCase()
                })
            })
            const data = await res.json()
            if (res.ok) {
                setSuccess(true)
            } else {
                setError(data.error || 'Registration failed')
            }
        } catch (err) {
            console.error(err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    <div className="card text-center">
                        <div className="text-4xl mb-4">✉️</div>
                        <h2 className="text-xl font-bold text-dark-100 mb-2">{t('check_email')}</h2>
                        <p className="text-dark-500 text-sm mb-5">{t('verification_sent')}</p>
                        <Link to="/login">
                            <button className="btn-primary">{t('sign_in')}</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="card">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                            P
                        </div>
                        <h2 className="text-2xl font-bold text-dark-100">
                            {t('create_account')}
                        </h2>
                        <p className="mt-1 text-dark-500 text-sm">{t('join_anonymous')}</p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                {t('full_name')} <span className="text-dark-500 text-xs">(2-50 {t('characters') || 'characters'})</span>
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                onBlur={() => handleFieldBlur('full_name')}
                                className={`input ${fieldErrors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                maxLength={50}
                                required
                            />
                            {fieldErrors.full_name && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.full_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                {t('username')} <span className="text-dark-500 text-xs">(3-20 {t('characters') || 'characters'})</span>
                            </label>
                            <input
                                type="text"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={(e) => handleFieldChange('username', e.target.value.toLowerCase())}
                                onBlur={() => handleFieldBlur('username')}
                                className={`input ${fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                maxLength={20}
                                required
                            />
                            {fieldErrors.username && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('email')}</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                onBlur={() => handleFieldBlur('email')}
                                className={`input ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                required
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                {t('password')} <span className="text-dark-500 text-xs">(min 6 {t('characters') || 'characters'})</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                onBlur={() => handleFieldBlur('password')}
                                className={`input ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                minLength={6}
                                maxLength={100}
                                required
                            />
                            {fieldErrors.password && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? t('sending') : t('sign_up')}
                        </button>
                    </form>

                    <div className="text-center text-sm text-dark-500 mt-5">
                        {t('have_account')}{' '}
                        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                            {t('sign_in')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
