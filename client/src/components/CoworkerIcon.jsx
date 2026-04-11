import React from 'react'

const CoworkerIcon = ({ size = 36 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B7FF5" />
                    <stop offset="100%" stopColor="#2BC4D4" />
                </linearGradient>
            </defs>

            {/* Circle background */}
            <circle cx="18" cy="18" r="18" fill="url(#iconGrad)" />

            {/* Co. text inside */}
            <text
                x="18"
                y="23"
                fontFamily="Georgia, serif"
                fontSize="12"
                fontWeight="500"
                fill="white"
                textAnchor="middle"
            >
                Co.
            </text>
        </svg>
    )
}

export default CoworkerIcon