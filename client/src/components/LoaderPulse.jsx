import React from 'react'

const LoaderPulse = () => {
    return (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-6">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-gray-700 font-medium text-sm">Loading content...</p>
            </div>
        </div>
    );
}

export default LoaderPulse
