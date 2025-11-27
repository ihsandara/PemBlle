import { useState, useEffect } from 'react'
import Home from './Home'
import Landing from './Landing'

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return isLoggedIn ? <Home /> : <Landing />
}

export default HomePage
