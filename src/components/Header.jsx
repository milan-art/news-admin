import PropTypes from 'prop-types'

const Header = ({
  theme,
  onToggleTheme,
  onGlobalSearch,
  globalSearch,
  onOpenQuickAdd,
  onToggleSidebar,
}) => {
  return (
    <header className="app-header">
      <div className="app-header__leading">
        <button
          type="button"
          className="btn-icon header__menu"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      <form
        className="app-header__search"
        role="search"
        aria-label="Search articles and categories"
        onSubmit={(event) => event.preventDefault()}
      >
        <span className="app-header__search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          placeholder="Search articles, categories, contributors..."
          value={globalSearch}
          onChange={(event) => onGlobalSearch(event.target.value)}
        />
      </form>
      </div>

      <div className="app-header__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onOpenQuickAdd}
        >
          + Add News
        </button>
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          aria-label="Toggle light and dark mode"
        >
          {theme === 'light' ? '🌞' : '🌙'}
        </button>
        <button type="button" className="btn-icon" aria-label="Notifications">
          🔔
        </button>
        <div className="app-header__profile" role="button" tabIndex={0}>
          <img
            src="https://i.pravatar.cc/40?img=32"
            alt="Admin avatar"
            width={32}
            height={32}
          />
          <div>
            <p className="app-header__profile-name">Ava Martin</p>
            <p className="app-header__profile-role">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  onToggleTheme: PropTypes.func.isRequired,
  onGlobalSearch: PropTypes.func.isRequired,
  globalSearch: PropTypes.string.isRequired,
  onOpenQuickAdd: PropTypes.func.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
}

export default Header

