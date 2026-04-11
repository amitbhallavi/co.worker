import React from 'react'

const LoaderSpinner = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-6">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <div className="text-center">
                    <p className="text-white font-semibold text-sm">Processing...</p>
                </div>
            </div>
        </div>
    )
}

export default LoaderSpinner
