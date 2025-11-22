import PropTypes from 'prop-types'

const heatmapColors = ['#3a7dff', '#8c5bff', '#35c4a1', '#ff9f43', '#ff6f61']

const Analytics = ({ performance }) => {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">Analytics</h1>
          <p className="panel__subtitle">
            Compare reader journeys, session depth, and retention across categories.
          </p>
        </div>
        <div className="panel__filters">
          <button className="btn btn--ghost" type="button">
            Export CSV
          </button>
          <button className="btn btn--ghost" type="button">
            Schedule report
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card">
          <header>
            <h2>Engagement funnel</h2>
            <p>Conversion from visit to subscription</p>
          </header>
          <div className="analytics-funnel">
            {performance.funnel.map((step) => (
              <div key={step.label} className="funnel-step">
                <div
                  className="funnel-bar"
                  style={{ width: `${step.value}%` }}
                  aria-hidden="true"
                />
                <div>
                  <p>{step.label}</p>
                  <p>{step.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card">
          <header>
            <h2>Top categories</h2>
            <p>Share of total views this week</p>
          </header>
          <ul className="analytics-pie">
            {performance.topCategories.map((category, index) => (
              <li key={category.name}>
                <span
                  className="legend-dot"
                  style={{ backgroundColor: heatmapColors[index % heatmapColors.length] }}
                  aria-hidden="true"
                />
                <span>{category.name}</span>
                <span>{category.value}%</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="analytics-card analytics-card--wide">
          <header>
            <h2>Reader retention</h2>
            <p>Rolling 7-day cohort analysis</p>
          </header>
          <div className="retention-grid">
            {performance.retention.map((row) => (
              <div key={row.cohort} className="retention-row">
                <p>{row.cohort}</p>
                <div className="retention-bars">
                  {row.values.map((value, index) => (
                    <span
                      key={index}
                      className="retention-cell"
                      style={{ opacity: value / 100 }}
                      aria-label={`${value}% retained`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

Analytics.propTypes = {
  performance: PropTypes.shape({
    funnel: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      }),
    ).isRequired,
    topCategories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      }),
    ).isRequired,
    retention: PropTypes.arrayOf(
      PropTypes.shape({
        cohort: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(PropTypes.number).isRequired,
      }),
    ).isRequired,
  }).isRequired,
}

export default Analytics

