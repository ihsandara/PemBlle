import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FlagUK = () => (
    <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full object-cover shadow-sm border border-dark-700">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#FFF" d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
        <path fill="#C8102E" d="M424 294l216 163v23h-55L270 220v-20l315-200h55L424 164v130zM216 186L0 23v-23h55l315 260v20L55 480H0l216-164v-130z"/>
        <path fill="#FFF" d="M250 0h140v480H250zM0 170h640v140H0z"/>
        <path fill="#C8102E" d="M280 0h80v480h-80zM0 200h640v80H0z"/>
    </svg>
);

const FlagIraq = () => (
    <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full object-cover shadow-sm border border-dark-700">
        <path fill="#ce1126" d="M0 0h640v160H0z"/>
        <path fill="#fff" d="M0 160h640v160H0z"/>
        <path fill="#000" d="M0 320h640v160H0z"/>
        <text x="320" y="260" fill="#007a3d" fontSize="60" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">الله أكبر</text>
    </svg>
);

const FlagKurdistan = () => (
    <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full object-cover shadow-sm border border-dark-700">
        <path fill="#ce1126" d="M0 0h640v160H0z"/>
        <path fill="#fff" d="M0 160h640v160H0z"/>
        <path fill="#278e43" d="M0 320h640v160H0z"/>
        <g transform="translate(320 240)">
            <circle r="50" fill="#ffc50f"/>
            {[...Array(21)].map((_, i) => (
                <path 
                    key={i} 
                    d="M0 -60 L10 -90 L-10 -90 Z" 
                    fill="#ffc50f" 
                    transform={`rotate(${i * (360/21)})`}
                />
            ))}
        </g>
    </svg>
);

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [showDropdown, setShowDropdown] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: <FlagUK /> },
        { code: 'ar', name: 'العربية', flag: <FlagIraq /> },
        { code: 'ku', name: 'کوردی', flag: <FlagKurdistan /> }
    ];

    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        const isRtl = lng === 'ar' || lng === 'ku';
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm"
            >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors flex items-center space-x-3 ${i18n.language === lang.code ? 'bg-slate-800/50 text-rose-500' : 'text-slate-300'
                                    }`}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
