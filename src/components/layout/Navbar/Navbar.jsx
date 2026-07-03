import React from 'react'
import './Navbar.css'
import { Menu } from 'lucide-react'

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="eds-navbar">
      <div className="eds-navbar__inner">
        <button className="eds-navbar__menu" onClick={onToggleSidebar}><Menu /></button>
        <div className="eds-navbar__brand">EDS</div>
        <div className="eds-navbar__right">{/* placeholder for search, notifications, avatar */}</div>
      </div>
    </header>
  )
}
