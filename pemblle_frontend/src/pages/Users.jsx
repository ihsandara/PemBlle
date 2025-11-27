import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Users() {
    const { t } = useTranslation()
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const limit = 12
    const observer = useRef()

    const lastUserRef = useCallback(node => {
        if (loadingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore()
            }
        })
        if (node) observer.current.observe(node)
    }, [loadingMore, hasMore])

    const fetchUsers = async (searchQuery = '', newOffset = 0, append = false) => {
        try {
            if (newOffset === 0) setLoading(true)
            else setLoadingMore(true)

            const userStr = localStorage.getItem('user')
            const currentUser = userStr ? JSON.parse(userStr) : null
            const excludeParam = currentUser ? `&exclude=${currentUser.id}` : ''

            const res = await axios.get(`/api/users?search=${searchQuery}&limit=${limit}&offset=${newOffset}${excludeParam}`)
            
            if (append) {
                setUsers(prev => [...prev, ...res.data])
            } else {
                setUsers(res.data)
            }
            
            setHasMore(res.data.length === limit)
            setOffset(newOffset + res.data.length)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchUsers(search, offset, true)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setOffset(0)
            fetchUsers(search, 0, false)
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [search])

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-dark-100 mb-1">Discover People</h1>
                <p className="text-dark-500 text-sm">Find and connect with amazing people</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-sm">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Users Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-medium text-dark-200 mb-1">No users found</h3>
                    <p className="text-dark-500 text-sm">Try a different search term</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user, index) => (
                        <Link 
                            key={user.id} 
                            to={`/u/${user.username}`}
                            ref={index === users.length - 1 ? lastUserRef : null}
                            className="card-hover flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-semibold text-white">{user.username[0].toUpperCase()}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-medium text-dark-100 truncate">
                                    {user.full_name || user.username}
                                </h3>
                                <p className="text-dark-500 text-sm truncate">@{user.username}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Loading More */}
            {loadingMore && (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                </div>
            )}

            {!hasMore && users.length > 0 && (
                <div className="text-center py-6 text-dark-500 text-sm">
                    You've seen all users
                </div>
            )}
        </div>
    )
}

export default Users
