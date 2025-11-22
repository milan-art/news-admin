import { useMemo } from 'react'
import PropTypes from 'prop-types'

const Sidebar = ({
  activeSection,
  onSelectSection,
  collapsed,
  onCollapseToggle,
  notifications,
}) => {
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar__header">
        <button
          className="sidebar__toggle"
          onClick={onCollapseToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          ☰
        </button>
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark" aria-hidden="true">
            <span className="brand-gradient" />
          </span>
          <div>
            <p className="sidebar__brand-title">Daily Pulse</p>
            <p className="sidebar__brand-subtitle">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${
              activeSection === item.id ? 'is-active' : ''
            }`}
            onClick={() => onSelectSection(item.id)}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <span className="sidebar__nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar__nav-label">{item.label}</span>
            {item.id === 'news' && unreadCount > 0 ? (
              <span className="sidebar__badge" aria-label={`${unreadCount} new`}>
                {unreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__footer-label">Quick stats</p>
        <div className="sidebar__quick-stats" role="list">
          <div className="sidebar__quick-item" role="listitem">
            <span className="sidebar__quick-value">248</span>
            <span className="sidebar__quick-label">Articles</span>
          </div>
          <div className="sidebar__quick-item" role="listitem">
            <span className="sidebar__quick-value">32</span>
            <span className="sidebar__quick-label">Contributors</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSelectSection: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onCollapseToggle: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
      read: PropTypes.bool,
    }),
  ).isRequired,
}

export default Sidebar

