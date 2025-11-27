import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Login() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (res.status === 403 && data.code === 'unverified') {
                navigate('/verify-request', { state: { email: formData.email } })
                return
            }

            if (!res.ok) {
                setError(data.error || 'Login failed')
                return
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            navigate('/')
        } catch (err) {
            setError('Something went wrong')
            console.error(err)
        } finally {
            setLoading(false)
        }
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
                            {t('welcome')}
                        </h2>
                        <p className="mt-1 text-dark-500 text-sm">{t('sign_in_subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('email')}</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('password')}</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Signing in...' : t('sign_in')}
                        </button>
                    </form>

                    <div className="text-center text-sm text-dark-500 mt-5">
                        {t('no_account')}{' '}
                        <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                            {t('sign_up')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
