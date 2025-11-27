import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ShareModal from '../components/ShareModal'

function Profile() {
    const { t } = useTranslation()
    const [user, setUser] = useState({
        full_name: '',
        bio: '',
        avatar: '',
        username: ''
    })
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: ''
    })
    const [message, setMessage] = useState({ type: '', text: '' })
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [copied, setCopied] = useState(false)
    const [stats, setStats] = useState({ followers_count: 0, following_count: 0 })
    const [showShareModal, setShowShareModal] = useState(false)
    const [showFollowersModal, setShowFollowersModal] = useState(false)
    const [showFollowingModal, setShowFollowingModal] = useState(false)
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [followersAnonymousCount, setFollowersAnonymousCount] = useState(0)
    const [followingAnonymousCount, setFollowingAnonymousCount] = useState(0)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            if (userData.avatar) {
                setAvatarPreview(userData.avatar)
            }
            if (userData.id) {
                fetchStats(userData.id)
            }
        }
    }, [])

    const fetchStats = async (userId) => {
        try {
            const res = await axios.get(`/api/users/${userId}/follow-counts`)
            setStats(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchFollowers = async () => {
        if (!user.id) return
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
        if (!user.id) return
        try {
            const res = await axios.get(`/api/users/${user.id}/following`)
            setFollowing(res.data.following || [])
            setFollowingAnonymousCount(res.data.anonymous_count || 0)
            setShowFollowingModal(true)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarUpload = async () => {
        if (!avatarFile) return

        setUploading(true)
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('avatar', avatarFile)

            const res = await axios.post('/api/users/avatar', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            const updatedUser = { ...user, avatar: res.data.avatar_url }
            setUser(updatedUser)
            setAvatarPreview(res.data.avatar_url)
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setMessage({ type: 'success', text: t('avatar_uploaded') || 'Avatar uploaded successfully' })
            setAvatarFile(null)
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to upload avatar' })
        } finally {
            setUploading(false)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.put('/api/users/profile', {
                full_name: user.full_name,
                bio: user.bio,
                avatar: user.avatar
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            localStorage.setItem('user', JSON.stringify(res.data))
            setMessage({ type: 'success', text: t('profile_updated') || 'Profile updated successfully' })
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setChangingPassword(true)
        try {
            const token = localStorage.getItem('token')
            await axios.put('/api/auth/password', passwords, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessage({ type: 'success', text: t('password_changed') || 'Password changed successfully' })
            setPasswords({ old_password: '', new_password: '' })
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' })
        } finally {
            setChangingPassword(false)
        }
    }

    const copyProfileLink = () => {
        const link = `${window.location.origin}/u/${user.username}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const profileLink = `${window.location.origin}/u/${user.username}`

    return (
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
            {/* Profile Header Card */}
            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl overflow-hidden ring-4 ring-dark-700">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center sm:text-start">
                        <h1 className="text-xl sm:text-2xl font-bold text-dark-100">{user.full_name || user.username}</h1>
                        <p className="text-dark-400 text-sm">@{user.username}</p>
                        {user.bio && <p className="text-dark-300 text-sm mt-2 max-w-md">{user.bio}</p>}
                        
                        {/* Stats */}
                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                            <button onClick={fetchFollowers} className="text-center hover:opacity-80 transition-opacity">
                                <span className="text-lg font-bold text-dark-100">{stats.followers_count}</span>
                                <span className="text-xs text-dark-500 ms-1">{t('followers')}</span>
                            </button>
                            <button onClick={fetchFollowing} className="text-center hover:opacity-80 transition-opacity">
                                <span className="text-lg font-bold text-dark-100">{stats.following_count}</span>
                                <span className="text-xs text-dark-500 ms-1">{t('following')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Link to={`/u/${user.username}`} className="btn-primary text-center text-sm">
                            <svg className="w-4 h-4 inline me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {t('view_profile') || 'View Profile'}
                        </Link>
                        <button onClick={() => setShowShareModal(true)} className="btn-secondary text-sm flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            {t('share') || 'Share'}
                        </button>
                    </div>
                </div>

                {/* Profile Link */}
                <div className="mt-4 pt-4 border-t border-dark-700">
                    <p className="text-xs text-dark-500 mb-2">{t('your_profile_link') || 'Your profile link'}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-800 rounded-lg px-3 py-2 text-sm text-dark-300 overflow-hidden">
                            <span className="truncate block">{profileLink}</span>
                        </div>
                        <button 
                            onClick={copyProfileLink}
                            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                            <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Avatar Upload Button */}
                {avatarFile && (
                    <div className="mt-4 pt-4 border-t border-dark-700">
                        <button 
                            onClick={handleAvatarUpload} 
                            disabled={uploading}
                            className="btn-primary w-full sm:w-auto"
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('uploading') || 'Uploading...'}
                                </span>
                            ) : (
                                t('upload_avatar') || 'Upload New Avatar'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-6 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {message.text}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}
                >
                    <svg className="w-4 h-4 inline me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('edit_profile')}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}
                >
                    <svg className="w-4 h-4 inline me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('security') || 'Security'}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' ? (
                <div className="card">
                    <h2 className="text-lg font-semibold text-dark-100 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('personal_info') || 'Personal Information'}
                    </h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('full_name')}</label>
                            <input
                                type="text"
                                value={user.full_name || ''}
                                onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                className="input"
                                placeholder={t('enter_full_name') || 'Enter your full name'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('bio')}</label>
                            <textarea
                                value={user.bio || ''}
                                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                className="input resize-none"
                                rows="3"
                                placeholder={t('write_bio') || 'Write something about yourself...'}
                                maxLength={150}
                            />
                            <p className="text-xs text-dark-500 mt-1">{(user.bio || '').length}/150</p>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={saving} className="btn-primary">
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('saving') || 'Saving...'}
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 inline me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t('save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="card">
                    <h2 className="text-lg font-semibold text-dark-100 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        {t('change_password') || 'Change Password'}
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('current_password') || 'Current Password'}</label>
                            <input
                                type="password"
                                value={passwords.old_password}
                                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">{t('new_password') || 'New Password'}</label>
                            <input
                                type="password"
                                value={passwords.new_password}
                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                className="input"
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                            <p className="text-xs text-dark-500 mt-1">{t('password_hint') || 'Minimum 6 characters'}</p>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={changingPassword} className="btn-primary">
                                {changingPassword ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('updating') || 'Updating...'}
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 inline me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        {t('update_password') || 'Update Password'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
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
        </div>
    )
}

export default Profile
