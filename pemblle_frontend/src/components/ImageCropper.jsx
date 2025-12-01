import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useTranslation } from 'react-i18next'

// Helper function to create cropped image
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.src = url
    })

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // Return as blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg', 0.95)
    })
}

function ImageCropper({ image, onCropComplete, onCancel }) {
    const { t } = useTranslation()
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [processing, setProcessing] = useState(false)

    const onCropChange = useCallback((crop) => {
        setCrop(crop)
    }, [])

    const onZoomChange = useCallback((zoom) => {
        setZoom(zoom)
    }, [])

    const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels) return
        
        setProcessing(true)
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels)
            const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
            onCropComplete(croppedFile, URL.createObjectURL(croppedBlob))
        } catch (error) {
            console.error('Error cropping image:', error)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-dark-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-dark-700">
                {/* Header */}
                <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-800/50">
                    <h3 className="font-semibold text-dark-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('crop_image') || 'Crop Image'}
                    </h3>
                    <button 
                        onClick={onCancel} 
                        className="text-dark-400 hover:text-dark-100 p-1 rounded-lg hover:bg-dark-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative h-80 bg-dark-950">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropAreaComplete}
                    />
                </div>

                {/* Zoom Control */}
                <div className="p-4 bg-dark-800/50 border-t border-dark-700">
                    <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                        <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </div>
                    <p className="text-xs text-dark-500 text-center mt-2">
                        {t('drag_to_reposition') || 'Drag to reposition • Scroll to zoom'}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-dark-700 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors font-medium"
                    >
                        {t('cancel') || 'Cancel'}
                    </button>
                    <button
                        onClick={handleCropConfirm}
                        disabled={processing}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('processing') || 'Processing...'}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t('apply') || 'Apply'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImageCropper
