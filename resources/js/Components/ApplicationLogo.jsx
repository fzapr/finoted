export default function ApplicationLogo(props) {
    return (
        <div className={`flex items-center gap-3 ${props.className || ''}`}>
            <div className="relative flex items-center justify-center shrink-0">
                <svg width="36" height="40" viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Hexagonal Shield (Stability & Security) */}
                    <path 
                        d="M45 5L82.27 24.5V75.5L45 95L7.73 75.5V24.5L45 5Z" 
                        fill="#1E293B" 
                        stroke="#D4AF37" 
                        strokeWidth="2"
                    />
                    {/* Stylized 'F' + Note Stroke */}
                    <path 
                        d="M35 70V30H65" 
                        stroke="#F8FAFC" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    <path 
                        d="M35 50H55" 
                        stroke="#F8FAFC" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                    />
                    {/* The 'Noted' Accent (Subtle checkmark-like tail) */}
                    <path 
                        d="M60 30L68 22" 
                        stroke="#D4AF37" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                    />
                </svg>
            </div>
            <span className="text-2xl font-black tracking-widest text-slate-800 dark:text-slate-100 uppercase">
                Finoted
            </span>
        </div>
    );
}
