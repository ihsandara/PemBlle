import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-300 ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-rose-500 ml-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
