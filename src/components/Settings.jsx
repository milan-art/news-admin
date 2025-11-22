import PropTypes from 'prop-types'

const Settings = ({ preferences, onPreferencesChange }) => {
  const togglePreference = (key) => {
    onPreferencesChange({ ...preferences, [key]: !preferences[key] })
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">Settings</h1>
          <p className="panel__subtitle">
            Control newsroom defaults, alerts, and collaboration tools.
          </p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="settings-card">
          <h2>Notifications</h2>
          <label className="form__switch">
            <input
              type="checkbox"
              checked={preferences.emailAlerts}
              onChange={() => togglePreference('emailAlerts')}
            />
            <span>Email alerts for published stories</span>
          </label>
          <label className="form__switch">
            <input
              type="checkbox"
              checked={preferences.assignmentReminders}
              onChange={() => togglePreference('assignmentReminders')}
            />
            <span>Assignment reminders for journalists</span>
          </label>
          <label className="form__switch">
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={() => togglePreference('weeklyDigest')}
            />
            <span>Weekly digest to leadership inbox</span>
          </label>
        </section>
        <section className="settings-card">
          <h2>Editorial standards</h2>
          <label className="form__switch">
            <input
              type="checkbox"
              checked={preferences.requireTwoFactor}
              onChange={() => togglePreference('requireTwoFactor')}
            />
            <span>Require 2FA for newsroom login</span>
          </label>
          <label className="form__switch">
            <input
              type="checkbox"
              checked={preferences.autoArchiveDrafts}
              onChange={() => togglePreference('autoArchiveDrafts')}
            />
            <span>Auto archive drafts older than 60 days</span>
          </label>
          <label className="form__switch">
            <input
              type="checkbox"
              checked={preferences.requireEditorApproval}
              onChange={() => togglePreference('requireEditorApproval')}
            />
            <span>Require editor approval for publication</span>
          </label>
        </section>
      </div>
    </section>
  )
}

Settings.propTypes = {
  preferences: PropTypes.shape({
    emailAlerts: PropTypes.bool.isRequired,
    assignmentReminders: PropTypes.bool.isRequired,
    weeklyDigest: PropTypes.bool.isRequired,
    requireTwoFactor: PropTypes.bool.isRequired,
    autoArchiveDrafts: PropTypes.bool.isRequired,
    requireEditorApproval: PropTypes.bool.isRequired,
  }).isRequired,
  onPreferencesChange: PropTypes.func.isRequired,
}

export default Settings

