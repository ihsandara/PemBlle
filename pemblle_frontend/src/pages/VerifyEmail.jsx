import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Sparkles, ArrowRight, Mail, RefreshCw } from 'lucide-react'

function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [countdown, setCountdown] = useState(3)
    const hasVerified = useRef(false) // Prevent double execution in React Strict Mode

    useEffect(() => {
        const verify = async () => {
            // Prevent double execution
            if (hasVerified.current) return
            hasVerified.current = true

            if (!token) {
                console.error('❌ No token found in URL')
                setStatus('error')
                return
            }

            console.log('🔍 Attempting verification with token:', token)

            try {
                const res = await fetch(`/api/auth/verify/${token}`)
                const data = await res.json()

                console.log('📡 Verification response:', { status: res.status, data })

                if (res.ok) {
                    console.log('✅ Verification successful')
                    setStatus('success')
                    
                    // Countdown timer
                    let count = 3
                    const interval = setInterval(() => {
                        count--
                        setCountdown(count)
                        if (count === 0) {
                            clearInterval(interval)
                            navigate('/login')
                        }
                    }, 1000)
                } else {
                    console.error('❌ Verification failed:', data.error)
                    setStatus('error')
                }
            } catch (err) {
                console.error('❌ Verification error:', err)
                setStatus('error')
            }
        }

        verify()
    }, [token, navigate])

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Background decorations */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Main Card */}
                <div className="relative bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Gradient Header */}
                    <div className={`h-2 ${
                        status === 'verifying' ? 'bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 animate-pulse' :
                        status === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}></div>

                    <div className="p-8 sm:p-10 text-center">
                        {/* Verifying State */}
                        {status === 'verifying' && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin"></div>
                                </div>
                                
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Verifying your email</h2>
                                    <p className="text-dark-400">Please wait while we confirm your email address...</p>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-dark-500">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm font-mono">{token?.substring(0, 20)}...</span>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                    {/* Celebration particles */}
                                    <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
                                    <Sparkles className="absolute bottom-0 left-1/4 w-5 h-5 text-brand-400 animate-bounce delay-100" />
                                </div>
                                
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Email Verified! 🎉</h2>
                                    <p className="text-dark-400 mb-4">Your account is now fully activated.</p>
                                    <p className="text-dark-500 text-sm">Redirecting to login in <span className="text-brand-400 font-bold">{countdown}</span> seconds...</p>
                                </div>

                                <Link 
                                    to="/login"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/25"
                                >
                                    Continue to Login
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                                            <XCircle className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                                    <p className="text-dark-400 mb-1">We couldn't verify your email address.</p>
                                    <p className="text-dark-500 text-sm">The link may be invalid or expired.</p>
                                </div>

                                <div className="space-y-3">
                                    <Link 
                                        to="/login"
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold rounded-xl hover:from-brand-500 hover:to-purple-500 transition-all shadow-lg shadow-brand-500/25"
                                    >
                                        Go to Login
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-800 text-dark-300 font-medium rounded-xl hover:bg-dark-700 transition-colors border border-dark-700"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-xs text-dark-500">
                            Having trouble? <a href="mailto:support@pemblle.com" className="text-brand-400 hover:text-brand-300">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
