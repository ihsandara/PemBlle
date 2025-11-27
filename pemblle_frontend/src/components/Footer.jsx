import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="py-10 px-4 border-t border-dark-800 bg-dark-900/30">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-6 mb-6">
                    <div className="flex items-center gap-3">
                        <img src="/app_icon.png" alt="PemBlle" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                            <span className="text-dark-200 font-semibold">PemBlle</span>
                            <span className="text-dark-500 text-sm ms-2">©{new Date().getFullYear()}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <Link 
                            to="/policy" 
                            className="text-dark-400 hover:text-brand-400 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {t('privacy_policy')}
                        </Link>
                        <Link 
                            to="/terms" 
                            className="text-dark-400 hover:text-brand-400 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('terms_conditions')}
                        </Link>
                        <a 
                            href="https://github.com/ihsandara" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-dark-400 hover:text-brand-400 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <a 
                            href="https://github.com/ihsandara" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        </a>
                        <a 
                            href="https://ahsandara.site" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div className="text-center pt-6 border-t border-dark-800/50">
                    <div className="flex items-center justify-center gap-2 text-dark-500 text-sm">
                        <span>{t('developed_by')}</span>
                        <a 
                            href="https://ahsandara.site" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-300 transition-colors font-semibold"
                        >
                            Ahsan Dara
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
