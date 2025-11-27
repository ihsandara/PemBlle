import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ScrollText, Users, Ban, MessageSquare, ShieldAlert, Scale, FileText, AlertTriangle } from 'lucide-react'

function Terms() {
    const { t, i18n } = useTranslation()
    const isRtl = i18n.language === 'ar' || i18n.language === 'ku'
    const lastUpdated = 'November 27, 2025'

    const sections = [
        {
            icon: <Users className="w-6 h-6" />,
            title: t('terms_account'),
            content: t('terms_account_content'),
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: t('terms_content'),
            content: t('terms_content_content'),
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Ban className="w-6 h-6" />,
            title: t('terms_conduct'),
            content: t('terms_conduct_content'),
            gradient: 'from-red-500 to-rose-500'
        },
        {
            icon: <ShieldAlert className="w-6 h-6" />,
            title: t('terms_safety'),
            content: t('terms_safety_content'),
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: <Scale className="w-6 h-6" />,
            title: t('terms_rights'),
            content: t('terms_rights_content'),
            gradient: 'from-orange-500 to-amber-500'
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: t('terms_disclaimer'),
            content: t('terms_disclaimer_content'),
            gradient: 'from-indigo-500 to-violet-500'
        }
    ]

    return (
        <div className="min-h-[calc(100vh-5rem)] py-8 px-4">
            {/* Background effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 text-white mb-6 shadow-xl shadow-brand-500/30">
                        <ScrollText className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {t('terms_title')}
                        </span>
                    </h1>
                    <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                        {t('terms_subtitle')}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-dark-800/60 rounded-full text-dark-400 text-sm">
                        <FileText className="w-4 h-4" />
                        {t('last_updated')}: {lastUpdated}
                    </div>
                </div>

                {/* Introduction Card */}
                <div className="bg-dark-900/80 border border-dark-800 rounded-3xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-dark-100 mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                            <ScrollText className="w-5 h-5 text-brand-400" />
                        </span>
                        {t('terms_intro_title')}
                    </h2>
                    <p className="text-dark-300 leading-relaxed">
                        {t('terms_intro_content')}
                    </p>
                </div>

                {/* Policy Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div 
                            key={index}
                            className="group bg-dark-900/80 border border-dark-800 hover:border-dark-700 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5"
                        >
                            <h2 className="text-xl font-bold text-dark-100 mb-4 flex items-center gap-3">
                                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.gradient} text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    {section.icon}
                                </span>
                                {section.title}
                            </h2>
                            <p className="text-dark-300 leading-relaxed whitespace-pre-line">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Back to Home */}
                <div className="mt-10 text-center">
                    <Link 
                        to="/"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-brand-400 transition-colors"
                    >
                        <svg className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('back_to_home')}
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Terms
