import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'

function ChatRoom() {
    const { chatId } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [otherUser, setOtherUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)
    const ws = useRef(null)
    const currentUser = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchChatData()
        connectWebSocket()

        return () => {
            if (ws.current) {
                ws.current.close()
            }
        }
    }, [chatId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchChatData = async () => {
        try {
            const token = localStorage.getItem('token')
            
            // Fetch messages
            const res = await axios.get(`/api/chats/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessages(res.data || [])
            
            // Fetch chat list to get other user info
            const chatsRes = await axios.get('/api/chats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const chat = chatsRes.data?.find(c => c.ID === chatId)
            if (chat) {
                const other = chat.User1ID === currentUser.id ? chat.User2 : chat.User1
                setOtherUser(other)
            }
            
            // Mark as read
            axios.put(`/api/chats/${chatId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {})
            
        } catch (err) {
            console.error('Failed to fetch chat:', err)
        } finally {
            setLoading(false)
        }
    }

    const connectWebSocket = () => {
        try {
            ws.current = new WebSocket(`ws://localhost:8080/ws/${currentUser.id}`)
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === 'new_message' && data.chat_id === chatId) {
                    setMessages(prev => [...prev, data.message])
                }
            }
        } catch (err) {
            console.error('WebSocket error:', err)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.post(`/api/chats/${chatId}/messages`, {
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setMessages([...messages, res.data])
            setNewMessage('')
        } catch (err) {
            console.error('Failed to send message:', err)
        } finally {
            setSending(false)
        }
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (loading) {
        return (
            <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-500/30 border-t-brand-500 mb-3"></div>
                <p className="text-sm text-dark-400">{t('loading_messages')}</p>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-160px)] max-w-2xl mx-auto bg-dark-900 rounded-2xl sm:rounded-3xl border border-dark-800 flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-dark-800 bg-gradient-to-r from-dark-800/80 to-dark-900/80 backdrop-blur flex items-center gap-3">
                <Link to="/chat" className="p-2 -ml-1 hover:bg-dark-700 rounded-xl text-dark-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                
                {otherUser ? (
                    <Link to={`/u/${otherUser.username}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-dark-700 group-hover:ring-brand-500/50 transition-all">
                                {otherUser.avatar ? (
                                    <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-sm sm:text-base">
                                        {otherUser.username?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-brand-400 transition-colors">
                                {otherUser.full_name || otherUser.username}
                            </h2>
                            <p className="text-xs text-dark-400 truncate">@{otherUser.username}</p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex-1">
                        <div className="h-4 w-24 bg-dark-700 rounded animate-pulse"></div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-dark-950/50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-dark-500" />
                        </div>
                        <h3 className="text-white font-medium mb-1">{t('no_messages_yet')}</h3>
                        <p className="text-dark-400 text-sm">{t('send_first_message')}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.SenderID === currentUser.id
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].SenderID !== msg.SenderID)
                        
                        return (
                            <div key={msg.ID} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end max-w-[85%] sm:max-w-[75%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && (
                                        <div className={`w-7 h-7 rounded-full bg-brand-600 flex-shrink-0 flex items-center justify-center overflow-hidden ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                            {otherUser?.avatar ? (
                                                <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-white">
                                                    {otherUser?.username?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className={`
                                        px-3.5 py-2.5 rounded-2xl shadow-sm
                                        ${isMe 
                                            ? 'bg-gradient-to-br from-brand-600 to-purple-600 text-white rounded-br-md' 
                                            : 'bg-dark-800 text-dark-100 rounded-bl-md border border-dark-700'
                                        }
                                    `}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                            {msg.Content}
                                        </p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-dark-500'}`}>
                                            {formatTime(msg.CreatedAt)}
                                            {isMe && (
                                                <span className="ml-1">
                                                    {msg.is_read ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-dark-900 border-t border-dark-800">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-700 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage(e)
                                }
                            }}
                            placeholder={t('type_message')}
                            className="w-full bg-transparent border-none text-white placeholder-dark-500 px-4 py-3 max-h-32 min-h-[44px] resize-none focus:ring-0 focus:outline-none text-sm"
                            rows="1"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() || sending}
                        className="p-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 disabled:hover:from-brand-600 disabled:hover:to-purple-600 transition-all flex-shrink-0 shadow-lg shadow-brand-500/20"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatRoom
