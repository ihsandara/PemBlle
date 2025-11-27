import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'

function TellCard({ tell, onAnswer, showReplies = true, isSender = false }) {
    const { t } = useTranslation()
    const [answer, setAnswer] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [isReplying, setIsReplying] = useState(false)
    const [showAllReplies, setShowAllReplies] = useState(false)
    const [localReplies, setLocalReplies] = useState(tell.answer?.replies || [])

    const handleAnswer = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await axios.post(`/api/tells/${tell.id}/answer`, { content: answer }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            onAnswer(tell.id, res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReply = async (e) => {
        e.preventDefault()
        if (!replyContent.trim()) return
        
        setIsReplying(true)
        try {
            const res = await axios.post(`/api/tells/answers/${tell.answer.id}/reply`, { content: replyContent }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            // Add new reply to local state instead of reloading
            setLocalReplies(prev => [...prev, res.data])
            setReplyContent('')
        } catch (err) {
            console.error(err)
            alert('Failed to reply. You might not be authorized.')
        } finally {
            setIsReplying(false)
        }
    }

    return (
        <div className="card-hover">
            {/* Question from Anonymous/Sender */}
            <div className="flex items-start gap-3 mb-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSender ? 'bg-brand-600' : 'bg-dark-700'}`}>
                    {isSender ? (
                        <span className="text-sm font-semibold text-white">✓</span>
                    ) : (
                        <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-dark-300">
                            {isSender ? t('you_asked') : (tell.is_anonymous ? t('anonymous') : t('someone'))}
                        </span>
                        <span className="text-xs text-dark-600">•</span>
                        <span className="text-xs text-dark-500">
                            {formatDistanceToNow(new Date(tell.created_at))} {t('ago')}
                        </span>
                    </div>
                    <p className="text-dark-100 text-sm sm:text-base break-words">{tell.content}</p>
                </div>
            </div>

            {tell.answer ? (
                <div className="space-y-4">
                    {/* Answer from Profile Owner */}
                    <div className="flex items-start gap-3 ps-4 sm:ps-6 border-s-2 border-brand-600">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {tell.receiver?.avatar ? (
                                <img src={tell.receiver.avatar} alt="" className="w-full h-full object-cover" />
                            ) : tell.receiver?.username ? (
                                <span className="text-sm text-white font-semibold">{tell.receiver.username[0].toUpperCase()}</span>
                            ) : (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-brand-400">
                                    {isSender ? tell.receiver?.username : t('you_answered')}
                                </span>
                                <span className="text-xs text-dark-600">•</span>
                                <span className="text-xs text-dark-500">
                                    {formatDistanceToNow(new Date(tell.answer.created_at))} {t('ago')}
                                </span>
                            </div>
                            <p className="text-dark-200 text-sm sm:text-base break-words">{tell.answer.content}</p>
                        </div>
                    </div>

                    {/* Replies */}
                    {showReplies && localReplies && localReplies.length > 0 && (
                        <div className="space-y-3 mt-4 pt-4 border-t border-dark-800">
                            <div className="flex items-center gap-2 text-xs font-medium text-dark-500 uppercase tracking-wide">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {localReplies.length} {localReplies.length === 1 ? t('reply') : t('replies')}
                            </div>
                            
                            {(showAllReplies ? localReplies : localReplies.slice(0, 3)).map((reply) => {
                                // Check if reply is from the receiver (profile owner) by comparing sender_id with receiver.id
                                const isFromReceiver = reply.sender_id === tell.receiver?.id;
                                
                                // For sent tells (isSender=true): you are the original sender
                                //   - isFromReceiver=true → receiver replied → show their username
                                //   - isFromReceiver=false → you replied → show "You"
                                // For inbox tells (isSender=false): you are the receiver
                                //   - isFromReceiver=true → you replied → show "You"
                                //   - isFromReceiver=false → sender replied → show "Anonymous"
                                const isFromYou = isSender ? !isFromReceiver : isFromReceiver;
                                
                                let replyLabel;
                                if (isSender) {
                                    // Sent tab: You vs Receiver's username
                                    replyLabel = isFromReceiver ? tell.receiver?.username : t('you_answered');
                                } else {
                                    // Inbox tab: You vs Anonymous
                                    replyLabel = isFromReceiver ? t('you_answered') : t('anonymous');
                                }
                                
                                return (
                                    <div 
                                        key={reply.id} 
                                        className="flex items-start gap-2.5"
                                    >
                                        <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden ${
                                            isFromYou ? 'bg-brand-600' : (isFromReceiver ? 'bg-brand-600' : 'bg-dark-700')
                                        }`}>
                                            {isFromReceiver && tell.receiver?.avatar ? (
                                                <img src={tell.receiver.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : isFromYou ? (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : isFromReceiver ? (
                                                <span className="text-xs text-white font-semibold">{tell.receiver?.username?.[0]?.toUpperCase()}</span>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-xs font-medium ${isFromYou ? 'text-brand-400' : (isFromReceiver ? 'text-brand-400' : 'text-dark-400')}`}>
                                                {replyLabel}
                                            </span>
                                            <p className={`text-sm break-words mt-0.5 ${isFromYou ? 'text-dark-200' : (isFromReceiver ? 'text-dark-200' : 'text-dark-400')}`}>
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {localReplies.length > 3 && !showAllReplies && (
                                <button 
                                    onClick={() => setShowAllReplies(true)}
                                    className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                                >
                                    {t('see_more')} ({localReplies.length - 3})
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                            
                            {showAllReplies && localReplies.length > 3 && (
                                <button 
                                    onClick={() => setShowAllReplies(false)}
                                    className="text-sm text-dark-500 hover:text-dark-400 transition-colors flex items-center gap-1"
                                >
                                    {t('show_less')}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reply Form */}
                    {showReplies && (
                        <form onSubmit={handleReply} className="mt-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                    type="text" 
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={t('reply_placeholder')}
                                    className="input text-sm py-2.5"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isReplying}
                                    className="btn-primary px-4 whitespace-nowrap"
                                >
                                    {isReplying ? '...' : t('reply')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <form onSubmit={handleAnswer} className="space-y-3">
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={t('write_answer')}
                        className="input resize-none"
                        rows="2"
                        required
                    />
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? t('sending') : t('answer')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default TellCard
