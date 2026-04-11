import React from 'react'

const Logo = () => {
    return (
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 1100" width="820" height="1100" font-family="Georgia, 'Times New Roman', serif">

                <defs>
                    {/* <!-- Main brand gradient: blue to cyan --> */}
                    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3B7FF5" />
                        <stop offset="100%" stop-color="#2BC4D4" />
                    </linearGradient>

                    {/* <!-- Dot accent gradient --> */}
                    <linearGradient id="dotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3B7FF5" />
                        <stop offset="100%" stop-color="#2BC4D4" />
                    </linearGradient>

                    {/* <!-- Clip circles for icon sizes --> */}
                    <clipPath id="c96"><circle cx="48" cy="48" r="48" /></clipPath>
                    <clipPath id="c72"><circle cx="36" cy="36" r="36" /></clipPath>
                    <clipPath id="c52"><circle cx="26" cy="26" r="26" /></clipPath>
                    <clipPath id="c36"><circle cx="18" cy="18" r="18" /></clipPath>
                    <clipPath id="c24"><circle cx="12" cy="12" r="12" /></clipPath>
                </defs>

                {/* <!-- ░░░ BACKGROUND ░░░ --> */}
                <rect width="820" height="1100" fill="#F8F9FB" rx="16" />

                {/* <!-- ░░░ SECTION LABELS ░░░ --> */}
                {/* <!-- Section 1: Full Lockup --> */}
                <text x="48" y="56" font-family="Georgia, serif" font-size="11" font-weight="400" fill="#9B9B9B" letter-spacing="2">FULL LOCKUP</text>
                <line x1="48" y1="64" x2="772" y2="64" stroke="#E2E4E8" stroke-width="1" />

                {/* <!-- ── XL Lockup ── --> */}
                {/* <!-- Icon circle 72px --> */}
                <circle cx="84" cy="136" r="36" fill="url(#brandGrad)" />
                <text x="84" y="148" font-family="Georgia, serif" font-size="21" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                {/* <!-- Wordmark --> */}
                <text x="134" y="152" font-family="Georgia, serif" font-size="40" font-weight="500" fill="#1A1A2E" letter-spacing="-0.5">Co</text>
                <text x="196" y="152" font-family="Georgia, serif" font-size="40" font-weight="400" fill="url(#dotGrad)">.</text>
                <text x="210" y="152" font-family="Georgia, serif" font-size="40" font-weight="400" fill="#1A1A2E" letter-spacing="-0.5">worker</text>
                {/* <!-- Size tag --> */}
                <text x="134" y="178" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" letter-spacing="1">XL — 72 px icon</text>

                {/* <!-- ── LG Lockup ── --> */}
                <circle cx="84" cy="238" r="26" fill="url(#brandGrad)" />
                <text x="84" y="247" font-family="Georgia, serif" font-size="15" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="124" y="252" font-family="Georgia, serif" font-size="28" font-weight="500" fill="#1A1A2E" letter-spacing="-0.3">Co</text>
                <text x="166" y="252" font-family="Georgia, serif" font-size="28" font-weight="400" fill="url(#dotGrad)">.</text>
                <text x="177" y="252" font-family="Georgia, serif" font-size="28" font-weight="400" fill="#1A1A2E" letter-spacing="-0.3">worker</text>
                <text x="124" y="270" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" letter-spacing="1">LG — 52 px icon</text>

                {/* <!-- ── MD Lockup ── --> */}
                <circle cx="84" cy="312" r="18" fill="url(#brandGrad)" />
                <text x="84" y="320" font-family="Georgia, serif" font-size="10" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="114" y="323" font-family="Georgia, serif" font-size="20" font-weight="500" fill="#1A1A2E" letter-spacing="-0.2">Co</text>
                <text x="140" y="323" font-family="Georgia, serif" font-size="20" font-weight="400" fill="url(#dotGrad)">.</text>
                <text x="148" y="323" font-family="Georgia, serif" font-size="20" font-weight="400" fill="#1A1A2E" letter-spacing="-0.2">worker</text>
                <text x="114" y="340" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" letter-spacing="1">MD — 36 px icon</text>

                {/* <!-- ── SM Lockup ── --> */}
                <circle cx="84" cy="372" r="12" fill="url(#brandGrad)" />
                <text x="84" y="378" font-family="Georgia, serif" font-size="7" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="106" y="380" font-family="Georgia, serif" font-size="14" font-weight="500" fill="#1A1A2E" letter-spacing="-0.1">Co</text>
                <text x="123" y="380" font-family="Georgia, serif" font-size="14" font-weight="400" fill="url(#dotGrad)">.</text>
                <text x="129" y="380" font-family="Georgia, serif" font-size="14" font-weight="400" fill="#1A1A2E" letter-spacing="-0.1">worker</text>
                <text x="106" y="396" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" letter-spacing="1">SM — 24 px icon</text>
                {/*  */}
                {/* <!-- ░░░ SECTION 2: ICON ONLY ░░░ --> */}
                <text x="48" y="440" font-family="Georgia, serif" font-size="11" font-weight="400" fill="#9B9B9B" letter-spacing="2">ICON ONLY</text>
                <line x1="48" y1="448" x2="772" y2="448" stroke="#E2E4E8" stroke-width="1" />

                {/* <!-- 96px --> */}
                <circle cx="96" cy="548" r="48" fill="url(#brandGrad)" />
                <text x="96" y="565" font-family="Georgia, serif" font-size="28" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="96" y="614" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" text-anchor="middle" letter-spacing="1">96 px</text>

                {/* <!-- 72px --> */}
                <circle cx="240" cy="548" r="36" fill="url(#brandGrad)" />
                <text x="240" y="563" font-family="Georgia, serif" font-size="21" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="240" y="614" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" text-anchor="middle" letter-spacing="1">72 px</text>

                {/* <!-- 52px --> */}
                <circle cx="358" cy="548" r="26" fill="url(#brandGrad)" />
                <text x="358" y="558" font-family="Georgia, serif" font-size="15" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="358" y="614" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" text-anchor="middle" letter-spacing="1">52 px</text>

                {/* <!-- 36px --> */}
                <circle cx="456" cy="548" r="18" fill="url(#brandGrad)" />
                <text x="456" y="556" font-family="Georgia, serif" font-size="10" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="456" y="614" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" text-anchor="middle" letter-spacing="1">36 px</text>

                {/* <!-- 24px --> */}
                <circle cx="530" cy="548" r="12" fill="url(#brandGrad)" />
                <text x="530" y="554" font-family="Georgia, serif" font-size="7" font-weight="500" fill="white" text-anchor="middle">C</text>
                <text x="530" y="614" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" text-anchor="middle" letter-spacing="1">24 px</text>

                {/* <!-- 16px --> */}
                <circle cx="592" cy="548" r="8" fill="url(#brandGrad)" />
                <text x="592" y="553" font-family="Georgia, serif" font-size="5" font-weight="500" fill="white" text-anchor="middle">C</text>
                <text x="592" y="614" font-family="Georgia, serif" font-size="10" fill="#B0B3BA" text-anchor="middle" letter-spacing="1">16 px</text>

                {/* <!-- ░░░ SECTION 3: NAVBAR PREVIEW ░░░ --> */}
                <text x="48" y="660" font-family="Georgia, serif" font-size="11" font-weight="400" fill="#9B9B9B" letter-spacing="2">NAVBAR PREVIEW</text>
                <line x1="48" y1="668" x2="772" y2="668" stroke="#E2E4E8" stroke-width="1" />

                {/* <!-- Navbar bar --> */}
                <rect x="48" y="686" width="724" height="56" rx="10" fill="white" stroke="#E2E4E8" stroke-width="1" />

                {/* <!-- Navbar logo icon --> */}
                <circle cx="84" cy="714" r="16" fill="url(#brandGrad)" />
                <text x="84" y="720" font-family="Georgia, serif" font-size="9" font-weight="500" fill="white" text-anchor="middle">Co.</text>

                {/* <!-- Navbar wordmark --> */}
                <text x="108" y="720" font-family="Georgia, serif" font-size="18" font-weight="500" fill="#1A1A2E">Co</text>
                <text x="131" y="720" font-family="Georgia, serif" font-size="18" fill="url(#dotGrad)">.</text>
                <text x="140" y="720" font-family="Georgia, serif" font-size="18" fill="#1A1A2E">worker</text>

                {/* <!-- Nav links --> */}
                <text x="310" y="720" font-family="Georgia, serif" font-size="13" fill="#6B7280">Features</text>
                <text x="390" y="720" font-family="Georgia, serif" font-size="13" fill="#6B7280">Pricing</text>
                <text x="458" y="720" font-family="Georgia, serif" font-size="13" fill="#6B7280">Docs</text>
                <text x="510" y="720" font-family="Georgia, serif" font-size="13" fill="#6B7280">Blog</text>

                {/* <!-- Sign in button --> */}
                <text x="594" y="720" font-family="Georgia, serif" font-size="13" fill="#6B7280">Sign in</text>

                {/* <!-- Get started pill button --> */}
                <rect x="650" y="702" width="104" height="24" rx="12" fill="url(#brandGrad)" />
                <text x="702" y="718" font-family="Georgia, serif" font-size="12" font-weight="500" fill="white" text-anchor="middle">Get started</text>

                {/* <!-- ░░░ SECTION 4: DARK VARIANT ░░░ --> */}
                <text x="48" y="788" font-family="Georgia, serif" font-size="11" font-weight="400" fill="#9B9B9B" letter-spacing="2">DARK VARIANT</text>
                <line x1="48" y1="796" x2="772" y2="796" stroke="#E2E4E8" stroke-width="1" />

                {/* <!-- Dark background --> */}
                <rect x="48" y="814" width="724" height="200" rx="12" fill="#0F1117" />

                {/* <!-- XL dark --> */}
                <circle cx="120" cy="894" r="36" fill="url(#brandGrad)" />
                <text x="120" y="908" font-family="Georgia, serif" font-size="21" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="170" y="910" font-family="Georgia, serif" font-size="40" font-weight="500" fill="#FFFFFF" letter-spacing="-0.5">Co</text>
                <text x="232" y="910" font-family="Georgia, serif" font-size="40" fill="url(#dotGrad)">.</text>
                <text x="246" y="910" font-family="Georgia, serif" font-size="40" fill="#FFFFFF" letter-spacing="-0.5">worker</text>

                {/* <!-- MD dark --> */}
                <circle cx="120" cy="962" r="18" fill="url(#brandGrad)" />
                <text x="120" y="970" font-family="Georgia, serif" font-size="10" font-weight="500" fill="white" text-anchor="middle">Co.</text>
                <text x="150" y="972" font-family="Georgia, serif" font-size="20" font-weight="500" fill="#FFFFFF">Co</text>
                <text x="176" y="972" font-family="Georgia, serif" font-size="20" fill="url(#dotGrad)">.</text>
                <text x="184" y="972" font-family="Georgia, serif" font-size="20" fill="#FFFFFF">worker</text>

                {/* <!-- ░░░ BRAND COLORS ░░░ --> */}
                <text x="48" y="1052" font-family="Georgia, serif" font-size="11" font-weight="400" fill="#9B9B9B" letter-spacing="2">BRAND COLORS</text>
                <line x1="48" y1="1060" x2="772" y2="1060" stroke="#E2E4E8" stroke-width="1" />

                {/* <!-- Color swatches --> */}
                <rect x="48" y="1072" width="48" height="14" rx="4" fill="#3B7FF5" />
                <text x="104" y="1083" font-family="Georgia, serif" font-size="10" fill="#6B7280">#3B7FF5  Blue</text>

                <rect x="220" y="1072" width="48" height="14" rx="4" fill="#2BC4D4" />
                <text x="276" y="1083" font-family="Georgia, serif" font-size="10" fill="#6B7280">#2BC4D4  Cyan</text>

                <rect x="400" y="1072" width="48" height="14" rx="4" fill="url(#brandGrad)" />
                <text x="456" y="1083" font-family="Georgia, serif" font-size="10" fill="#6B7280">Gradient  Brand</text>

                <rect x="580" y="1072" width="48" height="14" rx="4" fill="#0F1117" />
                <text x="636" y="1083" font-family="Georgia, serif" font-size="10" fill="#6B7280">#0F1117  Dark BG</text>

            </svg>
        </div>
    )
}

export default Logo
