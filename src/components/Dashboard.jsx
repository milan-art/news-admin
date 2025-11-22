import PropTypes from 'prop-types'
import { statSummary } from '../data/mockData.js'

const miniTrendPalette = [
  '#3a7dff',
  '#ff6f61',
  '#35c4a1',
  '#8c5bff',
  '#ff9f43',
]

const Dashboard = ({ recentNews, topContributors }) => {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">Dashboard overview</h1>
          <p className="panel__subtitle">
            Monitor newsroom performance at a glance. Updated moments ago.
          </p>
        </div>
        <div className="panel__filters">
          <button className="btn btn--ghost" type="button">
            Last 7 days
          </button>
          <button className="btn btn--ghost" type="button">
            Export report
          </button>
        </div>
      </div>

      <div className="dashboard__cards">
        {statSummary.map((stat, index) => (
          <article key={stat.id} className="dashboard__card">
            <span
              className="dashboard__card-accent"
              style={{ background: miniTrendPalette[index % miniTrendPalette.length] }}
              aria-hidden="true"
            />
            <p className="dashboard__card-label">{stat.label}</p>
            <p className="dashboard__card-value">{stat.value}</p>
            <p className="dashboard__card-trend">{stat.trend}</p>
          </article>
        ))}
      </div>

      <div className="dashboard__grid">
        <article className="dashboard__panel">
          <header>
            <h2>Performance snapshot</h2>
            <p>Traffic sources and reader engagement</p>
          </header>
          <div className="dashboard__chart">
            <div className="chart-area">
              <div className="chart-line chart-line--primary" />
              <div className="chart-line chart-line--secondary" />
            </div>
            <ul className="chart-legend">
              <li>
                <span className="legend-dot legend-dot--primary" />
                Organic readers
              </li>
              <li>
                <span className="legend-dot legend-dot--secondary" />
                Newsletter traffic
              </li>
            </ul>
          </div>
        </article>

        <article className="dashboard__panel">
          <header>
            <h2>Editorial in progress</h2>
            <p>Drafts and scheduled releases</p>
          </header>
          <ul className="dashboard__list">
            {recentNews.map((item) => (
              <li key={item.id}>
                <div>
                  <p className="dashboard__list-title">{item.headline}</p>
                  <p className="dashboard__list-meta">
                    {item.status === 'draft' ? 'Draft' : 'Scheduled'} ·{' '}
                    {new Intl.DateTimeFormat('en', {
                      day: 'numeric',
                      month: 'short',
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>
                <span className={`badge badge--${item.status}`}>
                  {item.status === 'draft' ? 'Draft' : 'Scheduled'}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard__panel">
          <header>
            <h2>Top contributors</h2>
            <p>Writers driving engagement</p>
          </header>
          <ul className="dashboard__list">
            {topContributors.map((user, index) => (
              <li key={user.id}>
                <div className="dashboard__avatar">
                  <img
                    src={`https://i.pravatar.cc/56?img=${index + 11}`}
                    alt=""
                    aria-hidden="true"
                  />
                  <div>
                    <p className="dashboard__list-title">{user.name}</p>
                    <p className="dashboard__list-meta">
                      {user.role} · {user.published} published
                    </p>
                  </div>
                </div>
                <span className="badge badge--success">
                  {user.trend > 0 ? `▲ ${user.trend}%` : `▼ ${Math.abs(user.trend)}%`}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard__panel dashboard__panel--wide">
          <header>
            <h2>Audience geography</h2>
            <p>Top regions by unique readers</p>
          </header>
          <div className="dashboard__heatmap">
            <div className="heatmap-grid">
              {[
                { region: 'North America', percentage: 42 },
                { region: 'Europe', percentage: 28 },
                { region: 'APAC', percentage: 18 },
                { region: 'Latin America', percentage: 8 },
                { region: 'Middle East & Africa', percentage: 4 },
              ].map((region) => (
                <div key={region.region} className="heatmap-cell">
                  <div className="heatmap-bar">
                    <span
                      style={{ width: `${region.percentage}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="heatmap-meta">
                    <p>{region.region}</p>
                    <p>{region.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

Dashboard.propTypes = {
  recentNews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      headline: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['draft', 'published']).isRequired,
      createdAt: PropTypes.string.isRequired,
    }),
  ).isRequired,
  topContributors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      published: PropTypes.number.isRequired,
      trend: PropTypes.number.isRequired,
    }),
  ).isRequired,
}

export default Dashboard

