import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import TellCard from '../components/TellCard'

function Notifications() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [tells, setTells] = useState([])
    const [sentTells, setSentTells] = useState([])
    const [activeTab, setActiveTab] = useState('inbox')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        fetchData()
    }, [navigate])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const [inboxRes, sentRes] = await Promise.all([
                axios.get('/api/tells', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/tells/sent', { headers: { Authorization: `Bearer ${token}` } })
            ])
            setTells(inboxRes.data)
            setSentTells(sentRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (tellId, answer) => {
        setTells((prev) => prev.map(t => t.id === tellId ? { ...t, answer } : t))
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-dark-100 mb-1">{t('inbox')}</h1>
                <p className="text-dark-500 text-xs sm:text-sm">{t('share_to_receive')}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`whitespace-nowrap text-sm ${activeTab === 'inbox' ? 'tab-active' : 'tab-inactive'}`}
                >
                    {t('inbox')} ({tells.length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`whitespace-nowrap text-sm ${activeTab === 'sent' ? 'tab-active' : 'tab-inactive'}`}
                >
                    {t('sent')} ({sentTells.filter(t => t.answer).length})
                </button>
            </div>

            {activeTab === 'inbox' ? (
                tells.length === 0 ? (
                    <div className="card text-center py-12 sm:py-16">
                        <div className="text-3xl sm:text-4xl mb-3">📭</div>
                        <h3 className="text-base sm:text-lg font-medium text-dark-200 mb-1">{t('no_messages')}</h3>
                        <p className="text-dark-500 text-sm">{t('share_to_receive')}</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {tells.map((tell) => (
                            <TellCard key={tell.id} tell={tell} onAnswer={handleAnswer} />
                        ))}
                    </div>
                )
            ) : (
                sentTells.filter(t => t.answer).length === 0 ? (
                    <div className="card text-center py-12 sm:py-16">
                        <div className="text-3xl sm:text-4xl mb-3">💬</div>
                        <h3 className="text-base sm:text-lg font-medium text-dark-200 mb-1">{t('no_answered_tells')}</h3>
                        <p className="text-dark-500 text-sm">{t('tells_appear_here')}</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {sentTells.filter(t => t.answer).map((tell) => (
                            <TellCard key={tell.id} tell={tell} isSender={true} />
                        ))}
                    </div>
                )
            )}
        </div>
    )
}

export default Notifications
