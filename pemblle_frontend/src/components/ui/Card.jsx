import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl ${className}`}>
            {children}
        </div>
    );
};

export default Card;
