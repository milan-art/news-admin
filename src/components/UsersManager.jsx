import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const roles = ['Admin', 'Editor', 'Journalist', 'Contributor']
const statusFilters = ['All', 'Active', 'Invited', 'Suspended']

const UsersManager = ({
  users,
  onInviteUser,
  onUpdateRole,
  onToggleStatus,
}) => {
  const [filterRole, setFilterRole] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Journalist',
  })

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = filterRole === 'All' || user.role === filterRole
      const matchesStatus = filterStatus === 'All' || user.status === filterStatus
      return matchesRole && matchesStatus
    })
  }, [users, filterRole, filterStatus])

  const handleInviteSubmit = (event) => {
    event.preventDefault()
    onInviteUser(inviteForm)
    setInviteForm({ name: '', email: '', role: 'Journalist' })
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">User management</h1>
          <p className="panel__subtitle">
            Assign newsroom roles, monitor status, and onboard collaborators.
          </p>
        </div>
        <div className="panel__filters">
          <select
            value={filterRole}
            onChange={(event) => setFilterRole(event.target.value)}
            aria-label="Filter by role"
          >
            <option value="All">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            aria-label="Filter by status"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="users-layout">
        <div className="table-wrapper">
          <table className="table table--users">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Last activity</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <img
                        src={`https://i.pravatar.cc/48?img=${index + 20}`}
                        alt=""
                        aria-hidden="true"
                      />
                      <div>
                        <p className="table__title">{user.name}</p>
                        <p className="table__meta">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) => onUpdateRole(user.id, event.target.value)}
                      aria-label={`Change role for ${user.name}`}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`badge badge--${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.lastLogin
                      ? new Intl.DateTimeFormat('en', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(user.lastLogin))
                      : 'Never'}
                  </td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onToggleStatus(user.id)}
                      aria-label={`Toggle status for ${user.name}`}
                    >
                      {user.status === 'Suspended' ? '🔓' : '🔒'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="invite-card">
          <h2>Invite contributor</h2>
          <p>
            Send a secure invite to bring a journalist, editor, or admin onto the
            Daily Pulse platform.
          </p>
          <form className="form" onSubmit={handleInviteSubmit}>
            <div className="form__group">
              <label htmlFor="invite-name">Name</label>
              <input
                id="invite-name"
                type="text"
                value={inviteForm.name}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="form__group">
              <label htmlFor="invite-email">Email</label>
              <input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="form__group">
              <label htmlFor="invite-role">Role</label>
              <select
                id="invite-role"
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, role: event.target.value }))
                }
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="form__actions">
              <button type="submit" className="btn btn--primary">
                Send invite
              </button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  )
}

UsersManager.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      lastLogin: PropTypes.string,
    }),
  ).isRequired,
  onInviteUser: PropTypes.func.isRequired,
  onUpdateRole: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
}

export default UsersManager

