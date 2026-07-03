import React from 'react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="eds-footer">
      <div className="eds-footer__inner">© {new Date().getFullYear()} EDS — Versão 0.1.0</div>
    </footer>
  )
}
