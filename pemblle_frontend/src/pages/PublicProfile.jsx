import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { Share2, MessageCircle, BadgeCheck, Sparkles, Send, Users, Heart } from 'lucide-react'
import ShareModal from '../components/ShareModal'

function PublicProfile() {
    const { username } = useParams()
    const { t } = useTranslation()
    const [user, setUser] = useState(null)
    const [tells, setTells] = useState([])
    const [tellContent, setTellContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [isFollowing, setIsFollowing] = useState(false)
    const [followAnonymous, setFollowAnonymous] = useState(false)
    const [followCounts, setFollowCounts] = useState({ followers_count: 0, following_count: 0 })
    const [followLoading, setFollowLoading] = useState(false)
    const [showFollowersModal, setShowFollowersModal] = useState(false)
    const [showFollowingModal, setShowFollowingModal] = useState(false)
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [followersAnonymousCount, setFollowersAnonymousCount] = useState(0)
    const [followingAnonymousCount, setFollowingAnonymousCount] = useState(0)
    const [expandedReplies, setExpandedReplies] = useState({})
    const [showShareModal, setShowShareModal] = useState(false)
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const profileLink = window.location.href
    
    const toggleReplies = (tellId) => {
        setExpandedReplies(prev => ({ ...prev, [tellId]: !prev[tellId] }))
    }
    const isOwnProfile = currentUser?.username === username

    useEffect(() => {
        fetchUserData()
    }, [username])

    const fetchUserData = async () => {
        try {
            const [userRes, tellsRes] = await Promise.all([
                axios.get(`/api/users/${username}`),
                axios.get(`/api/public/tells/${username}`)
            ])
            setUser(userRes.data)
            setTells(tellsRes.data || [])
            
            // Fetch follow counts
            const countsRes = await axios.get(`/api/users/${userRes.data.id}/follow-counts`)
            setFollowCounts(countsRes.data)
            
            // Check follow status if logged in
            const token = localStorage.getItem('token')
            if (token && !isOwnProfile) {
                try {
                    const statusRes = await axios.get(`/api/users/${userRes.data.id}/follow-status`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setIsFollowing(statusRes.data.is_following)
                    setFollowAnonymous(statusRes.data.is_anonymous || false)
                } catch (e) {}
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        
        setFollowLoading(true)
        try {
            if (isFollowing) {
                await axios.delete(`/api/users/${user.id}/follow`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setIsFollowing(false)
                setFollowCounts(prev => ({ ...prev, followers_count: prev.followers_count - 1 }))
            } else {
                await axios.post(`/api/users/${user.id}/follow`, { is_anonymous: followAnonymous }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setIsFollowing(true)
                setFollowCounts(prev => ({ ...prev, followers_count: prev.followers_count + 1 }))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setFollowLoading(false)
        }
    }

    const fetchFollowers = async () => {
        try {
            const res = await axios.get(`/api/users/${user.id}/followers`)
            setFollowers(res.data.followers || [])
            setFollowersAnonymousCount(res.data.anonymous_count || 0)
            setShowFollowersModal(true)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchFollowing = async () => {
        try {
            const res = await axios.get(`/api/users/${user.id}/following`)
            setFollowing(res.data.following || [])
            setFollowingAnonymousCount(res.data.anonymous_count || 0)
            setShowFollowingModal(true)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSendTell = async (e) => {
        e.preventDefault()
        if (!tellContent.trim()) return

        setSending(true)
        try {
            const token = localStorage.getItem('token')
            await axios.post('/api/tells/', {
                receiver_id: user.id,
                content: tellContent,
                is_anonymous: true
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
            setMessage({ type: 'success', text: '✨ Tell sent successfully!' })
            setTellContent('')
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send tell' })
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="card text-center py-16 max-w-md mx-auto">
                <div className="text-4xl mb-3">🔍</div>
                <h2 className="text-lg font-medium text-dark-200 mb-1">User not found</h2>
                <p className="text-dark-500 text-sm">This user does not exist.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* User Profile Header - Redesigned */}
            <div className="relative overflow-hidden rounded-3xl bg-dark-900 border border-dark-800">
                {/* Gradient Background Header */}
                <div className="h-32 sm:h-40 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 relative">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    
                    {/* Share Button */}
                    <button 
                        onClick={() => setShowShareModal(true)} 
                        className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all group"
                        title={t('share_profile')}
                    >
                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="px-5 sm:px-6 pb-6 text-center relative">
                    {/* Avatar - Positioned to overlap header */}
                    <div className="relative -mt-16 sm:-mt-20 mb-4 inline-block">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500">
                            <div className="w-full h-full rounded-full bg-dark-900 p-1">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl sm:text-4xl font-bold text-white">{user.username[0].toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Online/Verified Badge */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-dark-900 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                    </div>

                    {/* Name & Username */}
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                        {user.full_name || user.username}
                        {user.is_verified && <BadgeCheck className="w-5 h-5 text-brand-400" />}
                    </h1>
                    <p className="text-brand-400 font-medium mb-4">@{user.username}</p>
                    
                    {/* Bio */}
                    {user.bio && (
                        <div className="max-w-sm mx-auto mb-5">
                            <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">{user.bio}</p>
                        </div>
                    )}
                
                    {/* Stats Cards */}
                    <div className="flex justify-center gap-3 mb-5">
                        <button 
                            onClick={fetchFollowers} 
                            className="flex-1 max-w-[140px] p-3 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-brand-500/50 hover:bg-dark-800 transition-all group"
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-brand-400" />
                                <span className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">{followCounts.followers_count}</span>
                            </div>
                            <div className="text-xs text-dark-400">{t('followers')}</div>
                        </button>
                        <button 
                            onClick={fetchFollowing} 
                            className="flex-1 max-w-[140px] p-3 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-brand-500/50 hover:bg-dark-800 transition-all group"
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-pink-400" />
                                <span className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">{followCounts.following_count}</span>
                            </div>
                            <div className="text-xs text-dark-400">{t('following')}</div>
                        </button>
                        <div className="flex-1 max-w-[140px] p-3 rounded-2xl bg-dark-800/50 border border-dark-700">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <MessageCircle className="w-4 h-4 text-purple-400" />
                                <span className="text-lg font-bold text-white">{tells.length}</span>
                            </div>
                            <div className="text-xs text-dark-400">{t('answered_tells')}</div>
                        </div>
                    </div>
                
                    {/* Follow Button */}
                    {!isOwnProfile && localStorage.getItem('token') && (
                        <div className="space-y-3">
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all ${
                                    isFollowing 
                                        ? 'bg-dark-800 text-dark-200 hover:bg-red-500/20 hover:text-red-400 border border-dark-700' 
                                        : 'bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-500 hover:to-purple-500 shadow-lg shadow-brand-500/25'
                                }`}
                            >
                                {followLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    </span>
                                ) : isFollowing ? t('unfollow') : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {t('follow')}
                                    </span>
                                )}
                            </button>
                            
                            {!isFollowing && (
                                <label className="flex items-center justify-center gap-2 text-sm text-dark-400 cursor-pointer hover:text-dark-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={followAnonymous}
                                        onChange={(e) => setFollowAnonymous(e.target.checked)}
                                        className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-600 focus:ring-brand-500"
                                    />
                                    {t('follow_anonymously')}
                                </label>
                            )}
                        </div>
                    )}
                    
                    {isOwnProfile && (
                        <Link to="/profile" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark-800 text-dark-200 font-medium hover:bg-dark-700 transition-colors border border-dark-700">
                            <Sparkles className="w-4 h-4" />
                            {t('edit_profile')}
                        </Link>
                    )}
                </div>
            </div>
            
            {/* Followers Modal */}
            {showFollowersModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowFollowersModal(false)}>
                    <div className="bg-dark-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl border border-dark-700" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-800/50">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-dark-100">{t('followers')}</h3>
                                <span className="px-2 py-0.5 rounded-full bg-dark-700 text-xs text-dark-400 font-medium">{followers.length + followersAnonymousCount}</span>
                            </div>
                            <button onClick={() => setShowFollowersModal(false)} className="text-dark-400 hover:text-dark-100 p-1 rounded-lg hover:bg-dark-700 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-2 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
                            {followers.length === 0 && followersAnonymousCount === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-3 text-dark-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-dark-500">{t('no_users_found')}</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {/* Anonymous followers summary */}
                                    {followersAnonymousCount > 0 && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-dark-700">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center text-dark-400 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-dark-300 font-medium block">{followersAnonymousCount} {t('anonymous_followers')}</span>
                                                <span className="text-xs text-dark-500">{t('hidden_identity')}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Public followers */}
                                    {followers.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-800 transition-colors group">
                                            <Link to={`/u/${f.user?.username}`} className="flex items-center gap-3 group-hover:opacity-80 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden ring-2 ring-dark-800 group-hover:ring-dark-700 transition-all shrink-0">
                                                    {f.user?.avatar ? (
                                                        <img src={f.user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white font-semibold">{f.user?.username?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-dark-200 font-medium block truncate">{f.user?.full_name || f.user?.username}</span>
                                                    <span className="text-xs text-dark-500 block truncate">@{f.user?.username}</span>
                                                </div>
                                            </Link>
                                            <Link to={`/u/${f.user?.username}`} className="text-xs font-medium text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors ml-2">
                                                {t('view')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Following Modal */}
            {showFollowingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowFollowingModal(false)}>
                    <div className="bg-dark-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl border border-dark-700" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-800/50">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-dark-100">{t('following')}</h3>
                                <span className="px-2 py-0.5 rounded-full bg-dark-700 text-xs text-dark-400 font-medium">{following.length + followingAnonymousCount}</span>
                            </div>
                            <button onClick={() => setShowFollowingModal(false)} className="text-dark-400 hover:text-dark-100 p-1 rounded-lg hover:bg-dark-700 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-2 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
                            {following.length === 0 && followingAnonymousCount === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-3 text-dark-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    </div>
                                    <p className="text-dark-500">{t('no_users_found')}</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {/* Anonymous following summary */}
                                    {followingAnonymousCount > 0 && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-dark-700">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center text-dark-400 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-dark-300 font-medium block">{followingAnonymousCount} {t('anonymous_following')}</span>
                                                <span className="text-xs text-dark-500">{t('hidden_identity')}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Public following */}
                                    {following.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-800 transition-colors group">
                                            <Link to={`/u/${f.user?.username}`} className="flex items-center gap-3 group-hover:opacity-80 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden ring-2 ring-dark-800 group-hover:ring-dark-700 transition-all shrink-0">
                                                    {f.user?.avatar ? (
                                                        <img src={f.user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white font-semibold">{f.user?.username?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-dark-200 font-medium block truncate">{f.user?.full_name || f.user?.username}</span>
                                                    <span className="text-xs text-dark-500 block truncate">@{f.user?.username}</span>
                                                </div>
                                            </Link>
                                            <Link to={`/u/${f.user?.username}`} className="text-xs font-medium text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors ml-2">
                                                {t('view')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                profileLink={profileLink}
                user={user}
            />

            {/* Send Tell */}
            <div className="card">
                <h2 className="font-semibold text-dark-100 mb-4">{t('send_anonymous_tell')}</h2>
                {message.text && (
                    <div className={`p-3 mb-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSendTell} className="space-y-4">
                    <textarea
                        placeholder={`${t('send_anonymous_tell')} ${user.username}...`}
                        value={tellContent}
                        onChange={(e) => setTellContent(e.target.value)}
                        className="input resize-none text-sm sm:text-base"
                        rows="3"
                        required
                    />
                    <button type="submit" disabled={sending} className="btn-primary w-full">
                        {sending ? t('sending') : t('send_tell')}
                    </button>
                </form>
            </div>

            {/* Answered Tells */}
            <div>
                <h2 className="font-semibold text-dark-100 mb-4">{t('answered_tells')}</h2>
                {(!tells || tells.length === 0) ? (
                    <div className="card text-center py-10 sm:py-12">
                        <div className="text-3xl sm:text-4xl mb-3">📭</div>
                        <h3 className="text-base sm:text-lg font-medium text-dark-200 mb-1">{t('no_answered_tells')}</h3>
                        <p className="text-dark-500 text-sm">{t('be_first_tell')}</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {tells.map((tell) => (
                            <div key={tell.id} className="card">
                                {/* Question from Anonymous */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-dark-400">{t('anonymous')}</span>
                                            <span className="text-xs text-dark-600">•</span>
                                            <span className="text-xs text-dark-500">{t('anonymous_asked')}</span>
                                        </div>
                                        <p className="text-dark-200 text-sm sm:text-base break-words">{tell.content}</p>
                                    </div>
                                </div>

                                {/* Answer from Profile Owner */}
                                {tell.answer && (
                                    <div className="flex items-start gap-3 ps-4 sm:ps-6 border-s-2 border-brand-600">
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm text-white font-semibold">{user.username?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-brand-400">{user.username}</span>
                                                <span className="text-xs text-dark-600">•</span>
                                                <span className="text-xs text-dark-500">{t('replied')}</span>
                                            </div>
                                            <p className="text-dark-100 text-sm sm:text-base break-words">{tell.answer.content}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {tell.answer?.replies && tell.answer.replies.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-dark-800 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-dark-500 uppercase tracking-wide">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            {tell.answer.replies.length} {tell.answer.replies.length === 1 ? t('reply') : t('replies')}
                                        </div>
                                        
                                        {(expandedReplies[tell.id] ? tell.answer.replies : tell.answer.replies.slice(0, 3)).map((reply) => {
                                            const isFromReceiver = reply.sender_id === tell.receiver?.id || reply.sender_id === user.id;
                                            return (
                                                <div key={reply.id} className="flex items-start gap-2.5">
                                                    <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden ${isFromReceiver ? 'bg-brand-600' : 'bg-dark-700'}`}>
                                                        {isFromReceiver ? (
                                                            user.avatar ? (
                                                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs text-white font-semibold">{user.username?.[0]?.toUpperCase()}</span>
                                                            )
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-xs font-medium ${isFromReceiver ? 'text-brand-400' : 'text-dark-400'}`}>
                                                            {isFromReceiver ? user.username : t('anonymous')}
                                                        </span>
                                                        <p className={`text-sm break-words mt-0.5 ${isFromReceiver ? 'text-dark-200' : 'text-dark-400'}`}>
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {tell.answer.replies.length > 3 && (
                                            <button 
                                                onClick={() => toggleReplies(tell.id)}
                                                className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                                            >
                                                {expandedReplies[tell.id] ? (
                                                    <>
                                                        {t('show_less')}
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        {t('see_more')} ({tell.answer.replies.length - 3})
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
            </div>
        </div>
    )
}

export default PublicProfile
