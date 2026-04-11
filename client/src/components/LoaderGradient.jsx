import React from 'react'

const LoaderGradient = () => {

    
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-8">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <svg className="relative w-20 h-20 animate-spin" viewBox="0 0 100 100" fill="none">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" stroke="url(#grad1)" strokeWidth="8" strokeLinecap="round" strokeDasharray="70 220" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading</h3>
                    <p className="text-sm text-gray-600">Just a moment...</p>
                </div>
            </div>
        </div>
    )
}

export default LoaderGradient
