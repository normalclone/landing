'use client'

export function Footer() {
    return (
        <>
            <footer data-animate className="footer-wrap fade-in">
                <div className="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <span className="brand-logo" aria-hidden="true">
                            🐝
                        </span>
                        <span className="text-slate">© 2025 Beexamine</span>
                    </div>
                    <span className="chip">
                        Mật ong (CTA) • Ong vàng (badge) • Xanh than
                    </span>
                </div>
            </footer>
        </>
    )
}
