import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MessageCircle, Search, ArrowRight, Clock } from 'lucide-react'

function ChatList() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchChats()
    }, [])

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get('/api/chat', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setChats(res.data)
        } catch (err) {
            console.error('Failed to fetch chats:', err)
            setError(t('failed_fetch_chats'))
        } finally {
            setLoading(false)
        }
    }

    const filteredChats = chats.filter(chat => {
        const otherUser = chat.User1ID === JSON.parse(localStorage.getItem('user')).id ? chat.User2 : chat.User1
        return otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (diff < 48 * 60 * 60 * 1000) {
            return t('yesterday')
        } else {
            return date.toLocaleDateString()
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-7 h-7 text-brand-500" />
                    {t('messages')}
                </h1>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                    type="text"
                    placeholder={t('search_messages')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
                </div>
            ) : filteredChats.length === 0 ? (
                <div className="text-center py-12 bg-dark-800/30 rounded-2xl border border-dark-800">
                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-dark-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">{t('no_chats_yet')}</h3>
                    <p className="text-dark-400 mb-6">{t('start_conversation_hint')}</p>
                    <Link to="/users" className="btn-primary inline-flex items-center">
                        {t('find_users')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredChats.map(chat => {
                        const currentUser = JSON.parse(localStorage.getItem('user'))
                        const otherUser = chat.User1ID === currentUser.id ? chat.User2 : chat.User1
                        const lastMessage = chat.LastMessage
                        const isUnread = chat.UnreadCount > 0

                        return (
                            <Link 
                                key={chat.ID} 
                                to={`/chat/${chat.ID}`}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                    isUnread 
                                        ? 'bg-dark-800 border-brand-500/30 hover:bg-dark-700' 
                                        : 'bg-dark-900 border-dark-800 hover:bg-dark-800'
                                }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden ring-2 ring-dark-700">
                                        {otherUser?.avatar ? (
                                            <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-lg">
                                                {otherUser?.username?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {/* Online status indicator could go here */}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-semibold truncate ${isUnread ? 'text-white' : 'text-dark-200'}`}>
                                            {otherUser?.full_name || otherUser?.username}
                                        </h3>
                                        {lastMessage && (
                                            <span className={`text-xs whitespace-nowrap ml-2 ${isUnread ? 'text-brand-400 font-medium' : 'text-dark-500'}`}>
                                                {formatTime(lastMessage.CreatedAt)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate pr-4 ${isUnread ? 'text-dark-100 font-medium' : 'text-dark-400'}`}>
                                            {lastMessage ? (
                                                <>
                                                    {lastMessage.SenderID === currentUser.id && <span className="text-dark-500">{t('you')}: </span>}
                                                    {lastMessage.Content}
                                                </>
                                            ) : (
                                                <span className="italic text-dark-500">{t('start_chatting')}</span>
                                            )}
                                        </p>
                                        {isUnread && (
                                            <span className="w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                                {chat.UnreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ChatList
