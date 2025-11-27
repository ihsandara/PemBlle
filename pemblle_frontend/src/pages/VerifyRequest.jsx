import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function VerifyRequest() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState(location.state?.email || '')
    const [message, setMessage] = useState({ type: '', text: '' })
    const [loading, setLoading] = useState(false)

    const handleResend = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Verification email sent!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to send email' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Card className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="text-5xl mb-4">✉️</div>
                    <h2 className="text-3xl font-bold text-slate-100">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-slate-400">
                        Please verify your email before logging in. Enter your email to resend the verification link.
                    </p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleResend} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Resend Verification Link'}
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-400">
                    Already verified?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="font-medium text-rose-500 hover:text-rose-400 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </Card>
        </div>
    )
}

export default VerifyRequest
