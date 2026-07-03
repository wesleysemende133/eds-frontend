import React from 'react'
import './Sidebar.css'
import { User } from 'lucide-react'

export default function Sidebar({ collapsed = false }) {
  return (
    <aside className={`eds-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="eds-sidebar__top"> <div className="eds-sidebar__logo">EDS</div> </div>
      <nav className="eds-sidebar__nav">{/* nav items placeholder */}</nav>
      <div className="eds-sidebar__footer"><User /> <div className="eds-sidebar__profile">Usuario</div></div>
    </aside>
  )
}
