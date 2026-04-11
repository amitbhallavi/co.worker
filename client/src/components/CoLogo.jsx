export const CoLogo = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B7FF5" />
                    <stop offset="100%" stopColor="#2BC4D4" />
                </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="16" fill="url(#lg)" />
            <text x="16" y="21" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="white" textAnchor="middle">Co.</text>
        </svg>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "20px" }}>
            <span style={{ color: "#1a1a2e", fontWeight: 700 }}>Co</span>
            <span style={{ background: "linear-gradient(135deg,#3B7FF5,#2BC4D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
            <span style={{ color: "#1a1a2e", fontWeight: 400 }}>worker</span>
        </span>
    </div>
)