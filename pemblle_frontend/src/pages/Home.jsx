import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Home() {
    const { t } = useTranslation()
    const [feed, setFeed] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [expandedReplies, setExpandedReplies] = useState({})
    const limit = 10
    const observer = useRef()
    
    const toggleReplies = (tellId) => {
        setExpandedReplies(prev => ({ ...prev, [tellId]: !prev[tellId] }))
    }

    const lastFeedRef = useCallback(node => {
        if (loadingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore()
            }
        })
        if (node) observer.current.observe(node)
    }, [loadingMore, hasMore])

    const fetchFeed = async (newOffset = 0, append = false) => {
        try {
            if (newOffset === 0) setLoading(true)
            else setLoadingMore(true)

            // Get current user ID for personalized feed (prioritize followed users)
            const userStr = localStorage.getItem('user')
            const currentUser = userStr ? JSON.parse(userStr) : null
            const userIdParam = currentUser ? `&user_id=${currentUser.id}` : ''

            const res = await axios.get(`/api/public/feed?limit=${limit}&offset=${newOffset}${userIdParam}`)
            
            if (append) {
                setFeed(prev => [...prev, ...res.data])
            } else {
                setFeed(res.data || [])
            }
            
            setHasMore(res.data && res.data.length === limit)
            setOffset(newOffset + (res.data?.length || 0))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchFeed(offset, true)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userStr = localStorage.getItem('user')
                const currentUser = userStr ? JSON.parse(userStr) : null
                const excludeParam = currentUser ? `?exclude=${currentUser.id}&limit=5` : '?limit=5'

                const usersRes = await axios.get(`/api/users${excludeParam}`)
                setUsers(usersRes.data)
            } catch (err) {
                console.error(err)
            }
        }

        fetchFeed()
        fetchData()
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-dark-100 mb-1">
                        {t('home')}
                    </h1>
                    <p className="text-dark-500 text-xs sm:text-sm">{t('be_first')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16 sm:py-20">
                        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="card text-center py-12 sm:py-16">
                        <div className="text-3xl sm:text-4xl mb-3">📭</div>
                        <h3 className="text-base sm:text-lg font-medium text-dark-200 mb-1">{t('no_posts')}</h3>
                        <p className="text-dark-500 text-sm">{t('be_first')}</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {feed.map((item, index) => (
                            <div 
                                key={item.id} 
                                ref={index === feed.length - 1 ? lastFeedRef : null}
                                className="card-hover"
                            >
                                {/* Profile Owner Header */}
                                <Link to={`/u/${item.receiver?.username}`} className="flex items-center gap-3 mb-4 group">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden flex-shrink-0 ${item.is_from_following ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-dark-900' : ''}`}>
                                        {item.receiver?.avatar ? (
                                            <img src={item.receiver.avatar} alt={item.receiver.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs sm:text-sm font-semibold text-white">{item.receiver?.username?.[0]?.toUpperCase() || '?'}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-dark-100 group-hover:text-brand-400 transition-colors text-sm sm:text-base truncate">
                                                {item.receiver?.full_name || item.receiver?.username}
                                            </h3>
                                            {item.is_from_following && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-medium">
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {t('following')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-dark-500">@{item.receiver?.username}</p>
                                    </div>
                                </Link>

                                {/* Question from Anonymous */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0 p-3 rounded-xl bg-dark-800 border border-dark-700">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-medium text-dark-400">{item.is_anonymous ? t('anonymous') : t('someone')}</span>
                                            <span className="text-xs text-dark-600">•</span>
                                            <span className="text-xs text-dark-500">{t('anonymous_asked')}</span>
                                        </div>
                                        <p className="text-dark-200 text-sm sm:text-base break-words">{item.content}</p>
                                    </div>
                                </div>

                                {/* Answer from Profile Owner */}
                                {item.answer && (
                                    <div className="flex items-start gap-3 ps-4 sm:ps-6">
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.receiver?.avatar ? (
                                                <img src={item.receiver.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm text-white font-semibold">{item.receiver?.username?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 border-s-2 border-brand-600 ps-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs font-medium text-brand-400">{item.receiver?.username}</span>
                                                <span className="text-xs text-dark-600">•</span>
                                                <span className="text-xs text-dark-500">{t('replied')}</span>
                                            </div>
                                            <p className="text-dark-100 text-sm sm:text-base break-words">{item.answer.content}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {item.answer?.replies && item.answer.replies.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-dark-800 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-dark-500 uppercase tracking-wide">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            {item.answer.replies.length} {item.answer.replies.length === 1 ? t('reply') : t('replies')}
                                        </div>
                                        
                                        {(expandedReplies[item.id] ? item.answer.replies : item.answer.replies.slice(0, 3)).map((reply) => {
                                            const isFromReceiver = reply.sender_id === item.receiver?.id;
                                            return (
                                                <div key={reply.id} className="flex items-start gap-2.5">
                                                    <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden ${isFromReceiver ? 'bg-brand-600' : 'bg-dark-700'}`}>
                                                        {isFromReceiver ? (
                                                            item.receiver?.avatar ? (
                                                                <img src={item.receiver.avatar} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs text-white font-semibold">{item.receiver?.username?.[0]?.toUpperCase()}</span>
                                                            )
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-xs font-medium ${isFromReceiver ? 'text-brand-400' : 'text-dark-400'}`}>
                                                            {isFromReceiver ? item.receiver?.username : t('anonymous')}
                                                        </span>
                                                        <p className={`text-sm break-words mt-0.5 ${isFromReceiver ? 'text-dark-200' : 'text-dark-400'}`}>
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {item.answer.replies.length > 3 && (
                                            <button 
                                                onClick={() => toggleReplies(item.id)}
                                                className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                                            >
                                                {expandedReplies[item.id] ? (
                                                    <>
                                                        {t('show_less')}
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        {t('see_more')} ({item.answer.replies.length - 3})
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading More */}
                {loadingMore && (
                    <div className="flex justify-center py-6 sm:py-8">
                        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {!hasMore && feed.length > 0 && (
                    <div className="text-center py-4 sm:py-6 text-dark-500 text-xs sm:text-sm">
                        {t('reached_end')}
                    </div>
                )}
            </div>

            {/* Right Sidebar: Discover People */}
            <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24 space-y-4">
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-dark-100">{t('discover')}</h2>
                            <Link to="/users" className="text-xs sm:text-sm text-brand-400 hover:text-brand-300 transition-colors">
                                {t('see_all')}
                            </Link>
                        </div>
                        
                        <div className="flex lg:flex-col gap-3 lg:gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0">
                            {users.map(user => (
                                <Link 
                                    key={user.id} 
                                    to={`/u/${user.username}`}
                                    className="flex-shrink-0 lg:flex-shrink flex flex-col lg:flex-row items-center gap-2 lg:gap-3 p-3 lg:p-2.5 lg:-mx-2 rounded-xl bg-dark-800 lg:bg-transparent hover:bg-dark-700 lg:hover:bg-dark-800 transition-colors group w-24 lg:w-auto"
                                >
                                    <div className="w-12 h-12 lg:w-10 lg:h-10 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-semibold text-white">{user.username[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-center lg:text-start">
                                        <p className="font-medium text-dark-200 truncate group-hover:text-dark-100 transition-colors text-xs lg:text-sm">
                                            {user.full_name || user.username}
                                        </p>
                                        <p className="text-xs text-dark-500 truncate hidden lg:block">@{user.username}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {users.length === 0 && (
                            <div className="text-center py-4 sm:py-6 text-dark-500 text-xs sm:text-sm">
                                {t('no_users_found')}
                            </div>
                        )}
                    </div>

                    {/* Quick Links - Hidden on mobile */}
                    <div className="card hidden lg:block">
                        <h3 className="font-semibold text-dark-100 mb-3">{t('quick_links')}</h3>
                        <div className="space-y-1">
                            <Link to="/profile" className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-100 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {t('my_profile')}
                            </Link>
                            <Link to="/notifications" className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-100 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                {t('inbox')}
                            </Link>
                            <Link to="/users" className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-100 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                {t('all_users')}
                            </Link>
                            <Link to="/policy" className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-100 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                {t('privacy_policy')}
                            </Link>
                            <Link to="/terms" className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-100 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293V19a2 2 0 01-2 2z" /></svg>
                                {t('terms_conditions')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
