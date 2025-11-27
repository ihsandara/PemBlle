import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Shield, Eye, Lock, Database, Mail, Trash2, Globe, FileText } from 'lucide-react'

function PrivacyPolicy() {
    const { t, i18n } = useTranslation()
    const isRtl = i18n.language === 'ar' || i18n.language === 'ku'
    const lastUpdated = 'November 27, 2024'

    const sections = [
        {
            icon: <Database className="w-6 h-6" />,
            title: t('privacy_data_collect'),
            content: t('privacy_data_collect_content'),
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: t('privacy_data_use'),
            content: t('privacy_data_use_content'),
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: t('privacy_data_protection'),
            content: t('privacy_data_protection_content'),
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: t('privacy_third_party'),
            content: t('privacy_third_party_content'),
            gradient: 'from-orange-500 to-amber-500'
        },
        {
            icon: <Trash2 className="w-6 h-6" />,
            title: t('privacy_data_deletion'),
            content: t('privacy_data_deletion_content'),
            gradient: 'from-red-500 to-rose-500'
        },
        {
            icon: <Mail className="w-6 h-6" />,
            title: t('privacy_contact'),
            content: t('privacy_contact_content'),
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
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {t('privacy_policy')}
                        </span>
                    </h1>
                    <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                        {t('privacy_subtitle')}
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
                            <FileText className="w-5 h-5 text-brand-400" />
                        </span>
                        {t('privacy_intro_title')}
                    </h2>
                    <p className="text-dark-300 leading-relaxed">
                        {t('privacy_intro_content')}
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

                {/* Open Source Notice */}
                <div className="mt-8 bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-3xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-dark-300" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-dark-100 mb-2">{t('privacy_opensource_title')}</h3>
                    <p className="text-dark-400 mb-6 max-w-xl mx-auto">
                        {t('privacy_opensource_content')}
                    </p>
                    <a 
                        href="https://github.com/ihsandara/PemBlle" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-dark-500 rounded-xl text-dark-200 transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        {t('view_source_code')}
                    </a>
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

export default PrivacyPolicy
