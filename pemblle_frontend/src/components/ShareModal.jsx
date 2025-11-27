import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Download, Share2, X, Check, Smartphone } from 'lucide-react'

// Official Snapchat Ghost Icon
const SnapchatIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.976-.389-1.242-.779-1.227-1.168 0-.359.284-.689.734-.838.149-.06.329-.09.509-.09.12 0 .283.015.465.104.358.18.718.301 1.018.301.224 0 .359-.06.402-.089-.007-.15-.018-.33-.03-.51l-.003-.06c-.104-1.628-.229-3.654.3-4.847 1.582-3.545 4.939-3.821 5.928-3.821h.088z"/>
    </svg>
)

// Instagram Icon with gradient
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
)

function ShareModal({ isOpen, onClose, profileLink, user }) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const [sharing, setSharing] = useState(false)
    const [shareStatus, setShareStatus] = useState('')
    const canvasRef = useRef(null)

    if (!isOpen) return null

    const copyLink = () => {
        navigator.clipboard.writeText(profileLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Generate story image and return as blob
    const generateStoryBlob = () => {
        return new Promise((resolve) => {
            if (!user || !canvasRef.current) {
                resolve(null)
                return
            }
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            
            // Set dimensions (Story size 9:16)
            canvas.width = 1080
            canvas.height = 1920
            
            // Beautiful gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            gradient.addColorStop(0, '#667eea')
            gradient.addColorStop(0.3, '#764ba2')
            gradient.addColorStop(0.6, '#f093fb')
            gradient.addColorStop(1, '#f5576c')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Decorative circles
            ctx.globalAlpha = 0.1
            ctx.beginPath()
            ctx.arc(200, 300, 200, 0, Math.PI * 2)
            ctx.fillStyle = 'white'
            ctx.fill()
            ctx.beginPath()
            ctx.arc(880, 1600, 250, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
            
            // Glass Card Effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
            ctx.beginPath()
            ctx.roundRect(90, 550, 900, 820, 50)
            ctx.fill()
            
            // Card border glow
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.lineWidth = 3
            ctx.stroke()

            // Text
            ctx.textAlign = 'center'
            ctx.fillStyle = 'white'
            
            // Title with shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowBlur = 20
            ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillText('Ask Me Anything', 540, 750)
            
            // Subtitle
            ctx.font = '48px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.fillText('on PemBlle ✨', 540, 830)
            ctx.shadowBlur = 0
            
            // User Avatar Circle with gradient ring
            const centerX = 540
            const centerY = 1020
            const radius = 100
            
            // Outer ring gradient
            const ringGradient = ctx.createLinearGradient(centerX - radius - 15, centerY, centerX + radius + 15, centerY)
            ringGradient.addColorStop(0, '#f5576c')
            ringGradient.addColorStop(0.5, '#f093fb')
            ringGradient.addColorStop(1, '#667eea')
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius + 12, 0, Math.PI * 2)
            ctx.fillStyle = ringGradient
            ctx.fill()
            
            // White ring
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius + 6, 0, Math.PI * 2)
            ctx.fillStyle = 'white'
            ctx.fill()
            
            // Avatar background
            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.clip()
            
            const avatarGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
            avatarGradient.addColorStop(0, '#667eea')
            avatarGradient.addColorStop(1, '#764ba2')
            ctx.fillStyle = avatarGradient
            ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2)
            
            ctx.fillStyle = 'white'
            ctx.font = 'bold 90px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillText(user.username?.[0]?.toUpperCase() || '?', centerX, centerY + 32)
            ctx.restore()
            
            // Username
            ctx.fillStyle = 'white'
            ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillText(`@${user.username}`, 540, 1200)
            
            // Bio if exists
            if (user.bio) {
                ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
                const bioLines = user.bio.split('\n').slice(0, 2)
                bioLines.forEach((line, i) => {
                    ctx.fillText(line.substring(0, 40), 540, 1270 + (i * 45))
                })
            }

            // Call to action box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
            ctx.beginPath()
            ctx.roundRect(240, 1350, 600, 80, 40)
            ctx.fill()
            
            ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillStyle = 'white'
            ctx.fillText('🔗 Tap to send anonymous message', 540, 1402)

            // Logo at bottom
            ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillStyle = 'white'
            ctx.fillText('PemBlle', 540, 1780)
            
            // Small tagline
            ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
            ctx.fillText('Anonymous Q&A', 540, 1830)

            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png', 1)
        })
    }

    // Download story image
    const downloadStoryImage = async () => {
        const blob = await generateStoryBlob()
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `pemblle-story-${user.username}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
    }

    // Share to Instagram Story (mobile)
    const shareToInstagram = async () => {
        setSharing(true)
        setShareStatus('Creating story...')
        
        try {
            const blob = await generateStoryBlob()
            if (!blob) {
                setShareStatus('Error creating image')
                return
            }
            
            const file = new File([blob], `pemblle-story-${user.username}.png`, { type: 'image/png' })
            
            // Check if Web Share API with files is supported (mobile)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                setShareStatus('Opening share menu...')
                await navigator.share({
                    files: [file],
                    title: `Ask me anything on PemBlle!`,
                    text: `Send me anonymous messages! ${profileLink}`,
                })
                setShareStatus('Shared!')
            } else {
                // Fallback: Download the image
                setShareStatus('Downloading image...')
                await downloadStoryImage()
                setShareStatus('Image downloaded! Upload to Instagram Stories')
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share error:', err)
                setShareStatus('Download image and share manually')
                await downloadStoryImage()
            }
        } finally {
            setTimeout(() => {
                setSharing(false)
                setShareStatus('')
            }, 2000)
        }
    }

    // Share to Snapchat (mobile)
    const shareToSnapchat = async () => {
        setSharing(true)
        setShareStatus('Creating story...')
        
        try {
            const blob = await generateStoryBlob()
            if (!blob) {
                setShareStatus('Error creating image')
                return
            }
            
            const file = new File([blob], `pemblle-story-${user.username}.png`, { type: 'image/png' })
            
            // Check if Web Share API with files is supported (mobile)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                setShareStatus('Opening share menu...')
                await navigator.share({
                    files: [file],
                    title: `Ask me anything on PemBlle!`,
                    text: `Send me anonymous messages! ${profileLink}`,
                })
                setShareStatus('Shared!')
            } else {
                // Fallback: Download the image
                setShareStatus('Downloading image...')
                await downloadStoryImage()
                setShareStatus('Image downloaded! Upload to Snapchat')
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share error:', err)
                setShareStatus('Download image and share manually')
                await downloadStoryImage()
            }
        } finally {
            setTimeout(() => {
                setSharing(false)
                setShareStatus('')
            }, 2000)
        }
    }

    // Legacy download function for preview click
    const generateStoryImage = () => {
        downloadStoryImage()
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-dark-900 border border-dark-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-slide-up sm:animate-none" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="p-4 sm:p-5 border-b border-dark-800 flex justify-between items-center bg-dark-800/30 shrink-0">
                    {/* Mobile drag indicator */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-dark-600 rounded-full sm:hidden"></div>
                    
                    <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
                        {t('share_profile')}
                    </h3>
                    <button onClick={onClose} className="text-dark-400 hover:text-white p-1.5 sm:p-1 rounded-lg hover:bg-dark-800 transition-colors -mr-1">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
                    {/* Story Preview Card - Smaller on mobile */}
                    {user && (
                        <div className="mb-5 sm:mb-8">
                            <h4 className="text-xs sm:text-sm font-medium text-dark-400 mb-2 sm:mb-3 uppercase tracking-wider">Create Story Post</h4>
                            <div 
                                className="aspect-[9/16] max-h-[200px] sm:max-h-[280px] w-auto mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 relative overflow-hidden shadow-lg group cursor-pointer"
                                onClick={generateStoryImage}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 sm:p-6 text-center">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-6 rounded-xl sm:rounded-2xl w-full">
                                        <h3 className="font-bold text-sm sm:text-2xl mb-0.5 sm:mb-1">Ask Me Anything</h3>
                                        <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-6">in PemBlle</p>
                                        
                                        <div className="w-10 h-10 sm:w-20 sm:h-20 bg-dark-900 rounded-full mx-auto mb-1.5 sm:mb-3 flex items-center justify-center text-sm sm:text-2xl font-bold ring-2 sm:ring-4 ring-white/20">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                        <p className="font-bold text-xs sm:text-lg">@{user.username}</p>
                                    </div>
                                    <div className="absolute bottom-2 sm:bottom-6">
                                        <span className="font-bold text-xs sm:text-xl opacity-90">PemBlle</span>
                                    </div>
                                    
                                    {/* Hover/Tap Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white text-dark-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-base flex items-center gap-1.5 sm:gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Download
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    )}

                    {/* Share Status */}
                    {shareStatus && (
                        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-center">
                            <p className="text-xs sm:text-sm text-brand-400 flex items-center justify-center gap-2">
                                {sharing && <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin"></span>}
                                {shareStatus}
                            </p>
                        </div>
                    )}

                    {/* Share Actions - Stack on very small screens */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <button 
                            onClick={shareToSnapchat} 
                            disabled={sharing}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-3.5 rounded-xl bg-[#FFFC00] text-black font-bold text-sm sm:text-base hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <SnapchatIcon />
                            Snapchat
                        </button>
                        <button 
                            onClick={shareToInstagram} 
                            disabled={sharing}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-3.5 rounded-xl bg-gradient-to-tr from-[#FFDD55] via-[#FF543E] to-[#833AB4] text-white font-bold text-sm sm:text-base hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <InstagramIcon />
                            Instagram
                        </button>
                    </div>

                    {/* Download Button */}
                    <button 
                        onClick={downloadStoryImage}
                        disabled={sharing}
                        className="w-full flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-xl bg-dark-800 text-dark-200 font-medium text-sm sm:text-base hover:bg-dark-700 transition-colors mb-4 sm:mb-6 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        Download Story Image
                    </button>

                    {/* Mobile Tip - Hidden on mobile (they already know) */}
                    <div className="hidden sm:block mb-6 p-3 rounded-xl bg-dark-800/50 border border-dark-700">
                        <p className="text-xs text-dark-400 flex items-start gap-2">
                            <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>On mobile, tap Snapchat or Instagram to share directly to your story. On desktop, download and upload manually.</span>
                        </p>
                    </div>

                    {/* Copy Link */}
                    <div className="bg-dark-800/50 rounded-xl p-2.5 sm:p-3 border border-dark-800 flex items-center gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-dark-400 mb-0.5 sm:mb-1">Profile Link</p>
                            <p className="text-xs sm:text-sm text-dark-200 truncate font-mono">{profileLink}</p>
                        </div>
                        <button 
                            onClick={copyLink}
                            className={`p-2 sm:p-2 rounded-lg transition-all shrink-0 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-brand-600 text-white hover:bg-brand-500'}`}
                        >
                            {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                    </div>
                </div>

                {/* Safe area padding for mobile */}
                <div className="h-safe-area-inset-bottom sm:hidden"></div>
            </div>

            {/* Animation styles */}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .h-safe-area-inset-bottom {
                    height: env(safe-area-inset-bottom, 0);
                }
            `}</style>
        </div>
    )
}

export default ShareModal
