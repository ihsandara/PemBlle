import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Send, ArrowLeft, MoreVertical, Phone, Video, Info } from 'lucide-react'

function ChatRoom() {
    const { chatId } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [chat, setChat] = useState(null)
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
            // In a real app, you'd fetch chat details and messages separately or together
            // Here assuming we have an endpoint to get messages which also validates access
            const res = await axios.get(`/api/chat/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessages(res.data)
            setLoading(false)

            // We also need to know who we are chatting with
            // This endpoint would ideally return chat metadata including participants
            // For now, let's assume we can derive it or fetch it
            // const chatRes = await axios.get(`/api/chat/${chatId}`, ...)
        } catch (err) {
            console.error('Failed to fetch chat:', err)
            // navigate('/chat')
        }
    }

    const connectWebSocket = () => {
        const token = localStorage.getItem('token')
        // WebSocket connection logic here
        // ws.current = new WebSocket(...)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.post(`/api/chat/${chatId}/messages`, {
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

    // Placeholder for the other user (would come from API)
    const otherUser = {
        username: 'user',
        full_name: 'Chat User',
        avatar: null
    }

    if (loading) {
        return (
            <div className="h-[calc(100vh-80px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-140px)] max-w-4xl mx-auto bg-dark-900 sm:rounded-2xl sm:border border-dark-800 flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-dark-800 bg-dark-900/95 backdrop-blur flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <Link to="/chat" className="p-2 -ml-2 hover:bg-dark-800 rounded-full text-dark-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden ring-2 ring-dark-800">
                                {otherUser.avatar ? (
                                    <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold">
                                        {otherUser.username?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-900 rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-sm sm:text-base leading-tight">
                                {otherUser.full_name || otherUser.username}
                            </h2>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-full transition-colors hidden sm:block">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-full transition-colors hidden sm:block">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-full transition-colors">
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-950 bg-[url('/chat-bg-pattern.png')] bg-repeat opacity-100">
                {messages.map((msg, index) => {
                    const isMe = msg.SenderID === currentUser.id
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].SenderID !== msg.SenderID)
                    
                    return (
                        <div key={msg.ID} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`flex items-end max-w-[85%] sm:max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-dark-800 flex-shrink-0 flex items-center justify-center overflow-hidden opacity-100 transition-opacity" style={{ opacity: showAvatar ? 1 : 0 }}>
                                        {showAvatar && (
                                            otherUser.avatar ? (
                                                <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-dark-400">
                                                    {otherUser.username?.[0]?.toUpperCase()}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}

                                <div className={`
                                    px-4 py-2.5 rounded-2xl shadow-sm relative
                                    ${isMe 
                                        ? 'bg-brand-600 text-white rounded-br-none' 
                                        : 'bg-dark-800 text-dark-100 rounded-bl-none'
                                    }
                                `}>
                                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                                        {msg.Content}
                                    </p>
                                    <p className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-brand-100' : 'text-dark-400'}`}>
                                        {formatTime(msg.CreatedAt)}
                                        {isMe && (
                                            <span className="ml-1 inline-block">
                                                {msg.is_read ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-dark-900 border-t border-dark-800">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-700 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
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
                            className="w-full bg-transparent border-none text-white placeholder-dark-400 px-4 py-3 max-h-32 min-h-[44px] resize-none focus:ring-0 text-sm sm:text-base"
                            rows="1"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() || sending}
                        className="p-3 rounded-full bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors flex-shrink-0 shadow-lg shadow-brand-600/20"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-5 h-5 ml-0.5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatRoom
