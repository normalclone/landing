'use client'

import Script from "next/dist/client/script"
import Link from "next/link"

export function Header() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
      <nav
        data-animate
        className="navbar navbar-expand-lg bg-surface nav-border py-2 fixed-top shadow-sm fade-in"
      >
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-2" href="/">
            <span className="brand-logo" aria-hidden="true">
              ??
            </span>
            <span className="brand-name">Beexamine</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarMain">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="/exams">
                  Luyện thi
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="/ranking">
                  Bảng xếp hạng
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="#progress">
                  Giới thiệu
                </Link>
              </li>
            </ul>
            <div className="ms-lg-3 mt-2 mt-lg-0 d-flex gap-2">
              <a className="btn btn-honey" href="/exams">
                Bắt đầu luyện thi
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
