import PropTypes from 'prop-types'
import { useEffect } from 'react'

const variantIcons = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
  warning: '⚠️',
}

const NotificationCenter = ({ notifications, onDismiss }) => {
  useEffect(() => {
    if (notifications.length === 0) return
    const timers = notifications.map((notification) =>
      window.setTimeout(
        () => onDismiss(notification.id),
        notification.duration ?? 4000,
      ),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [notifications, onDismiss])

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast toast--${notification.variant ?? 'info'}`}
        >
          <span className="toast__icon" aria-hidden="true">
            {variantIcons[notification.variant ?? 'info']}
          </span>
          <div className="toast__content">
            <p>{notification.message}</p>
            {notification.detail ? <p className="toast__detail">{notification.detail}</p> : null}
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

NotificationCenter.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
      duration: PropTypes.number,
      detail: PropTypes.string,
    }),
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
}

export default NotificationCenter

