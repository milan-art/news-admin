import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const emptyCategory = {
  name: '',
  color: '#3a7dff',
  description: '',
}

const CategoriesManager = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  newsCountByCategory,
}) => {
  const [formState, setFormState] = useState(emptyCategory)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const resetForm = () => {
    setFormState(emptyCategory)
    setSelectedCategory(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (selectedCategory) {
      onUpdateCategory(selectedCategory.id, formState)
    } else {
      onCreateCategory(formState)
    }
    resetForm()
  }

  const handleSelect = (category) => {
    setSelectedCategory(category)
    setFormState({
      name: category.name,
      color: category.color,
      description: category.description,
    })
  }

  const stats = useMemo(
    () =>
      categories.reduce(
        (acc, category) => {
          const count = newsCountByCategory[category.id] ?? 0
          acc.total += count
          if (count === 0) {
            acc.empty += 1
          }
          return acc
        },
        { total: 0, empty: 0 },
      ),
    [categories, newsCountByCategory],
  )

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">Categories</h1>
          <p className="panel__subtitle">
            Define color-coded sections that mirror the Daily Pulse experience.
          </p>
        </div>
        <div className="panel__summary">
          <span className="badge badge--neutral">
            {categories.length} categories live
          </span>
          <span className="badge badge--neutral">
            {stats.empty} without published news
          </span>
        </div>
      </div>

      <div className="categories-layout">
        <div className="categories-grid" role="list">
          {categories.map((category) => (
            <article
              key={category.id}
              role="listitem"
              className={`category-card ${
                selectedCategory?.id === category.id ? 'is-active' : ''
              }`}
              onClick={() => handleSelect(category)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleSelect(category)
                }
              }}
              tabIndex={0}
            >
              <div className="category-card__header">
                <span
                  className="category-card__color"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <div>
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                </div>
              </div>
              <footer>
                <span className="badge badge--neutral">
                  {newsCountByCategory[category.id] ?? 0} news
                </span>
                <div className="category-card__actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleSelect(category)
                    }}
                    aria-label={`Edit ${category.name}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDeleteCategory(category.id)
                    }}
                    aria-label={`Delete ${category.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>

        <aside className="categories-form">
          <h2>{selectedCategory ? 'Edit category' : 'Create category'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form__group">
              <label htmlFor="category-name">Name</label>
              <input
                id="category-name"
                type="text"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Politics, Tech..."
                required
              />
            </div>
            <div className="form__group">
              <label htmlFor="category-description">Description</label>
              <textarea
                id="category-description"
                rows={3}
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Explain the purpose of this category."
              />
            </div>
            <div className="form__group">
              <label htmlFor="category-color">Color</label>
              <div className="color-input">
                <input
                  id="category-color"
                  type="color"
                  value={formState.color}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, color: event.target.value }))
                  }
                />
                <span>{formState.color.toUpperCase()}</span>
              </div>
            </div>

            <div className="form__actions">
              {selectedCategory ? (
                <button type="button" className="btn btn--ghost" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : (
                <button type="button" className="btn btn--ghost" onClick={resetForm}>
                  Reset
                </button>
              )}
              <button type="submit" className="btn btn--primary">
                {selectedCategory ? 'Save changes' : 'Add category'}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  )
}

CategoriesManager.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onCreateCategory: PropTypes.func.isRequired,
  onUpdateCategory: PropTypes.func.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
  newsCountByCategory: PropTypes.objectOf(PropTypes.number).isRequired,
}

export default CategoriesManager

