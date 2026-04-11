import React from 'react'

const Loader = () => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-6">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                    <div className="relative w-16 h-16 rounded-full border-4 border-gray-200 border-t-blue-500 border-r-cyan-500 animate-spin"></div>
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-white font-semibold text-lg">Loading</p>
                    <p className="text-gray-300 text-sm">Please wait...</p>
                </div>
            </div>
        </div>
    )
}

export default Loader
