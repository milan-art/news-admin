import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import NewsForm from './NewsForm.jsx'

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'views', label: 'Most viewed' },
  { value: 'alphabetical', label: 'Headline A�Z' },
]

const NewsManager = ({
  news,
  categories,
  onCreateNews,
  onUpdateNews,
  onDeleteNews,
  onBulkAction,
  onTogglePublish,
  filters,
  onFiltersChange,
  selectedNewsIds,
  onSelectionChange,
  externalCreateSignal,
  loading,
  error,
  pagination,
  onPageChange,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    if (externalCreateSignal > 0) {
      setFormMode('create')
      setEditingItem(null)
      setIsFormOpen(true)
    }
  }, [externalCreateSignal])

  const handleSearchChange = (event) => {
    onFiltersChange({ search: event.target.value, page: 1 })
  }

  const items = news ?? []

  const toggleSelection = (id) => {
    if (selectedNewsIds.includes(id)) {
      onSelectionChange(selectedNewsIds.filter((item) => item !== id))
    } else {
      onSelectionChange([...selectedNewsIds, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedNewsIds.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map((item) => item.id))
    }
  }

  const openCreateForm = () => {
    setFormMode('create')
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const openEditForm = (item) => {
    setFormMode('edit')
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const selectedCount = selectedNewsIds.length

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7}>
            <div className="table__empty">Loading articles</div>
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7}>
            <div className="table__empty">
              <p>{error}</p>
              <button className="btn btn--ghost" type="button" onClick={() => onPageChange(pagination.page)}>
                Retry
              </button>
            </div>
          </td>
        </tr>
      )
    }

    if (!items.length) {
      return (
        <tr>
          <td colSpan={7}>
            <div className="table__empty">
              <p>No news matches your filters yet.</p>
              <button className="btn btn--primary" onClick={openCreateForm}>
                Create your first story
              </button>
            </div>
          </td>
        </tr>
      )
    }

    return items.map((item) => {
      const isPublished = item.status === 'published'
      const isSelected = selectedNewsIds.includes(item.id)

      return (
        <tr key={item.id} className={isSelected ? 'is-selected' : undefined}>
          <td>
            <input
              type="checkbox"
              aria-label={`Select ${item.title}`}
              checked={isSelected}
              onChange={() => toggleSelection(item.id)}
            />
          </td>
          <td>
            <p className="table__title">{item.title}</p>
            <p className="table__meta">
              By {item.author}{' '}
              {item.updatedAt
                ? ` ${new Intl.DateTimeFormat('en', {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(item.updatedAt))}`
                : ''}
            </p>
            <div className="table__tags">
              {(item.tags ?? []).map((tag) => (
                <span key={tag} className="badge badge--neutral">
                  #{tag}
                </span>
              ))}
            </div>
          </td>
          <td>
            <span className={`badge badge--${item.status}`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
            {item.scheduled ? (
              <p className="table__meta">
                Scheduled{' '}
                {new Intl.DateTimeFormat('en', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(item.scheduled))}
              </p>
            ) : null}
          </td>
          <td>
            <span className="table__category">
              <span
                className="table__category-color"
                style={{ backgroundColor: item.category?.color ?? '#6c7a99' }}
                aria-hidden="true"
              />
              {item.category?.name ?? 'Unassigned'}
            </span>
          </td>
          <td>
            {item.createdAt
              ? new Intl.DateTimeFormat('en', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(item.createdAt))
              : '�'}
          </td>
          <td>{new Intl.NumberFormat().format(item.views ?? 0)}</td>
          <td className="table__actions">
            <button
              type="button"
              className="btn-icon"
              onClick={() => onTogglePublish(item.id, item.status)}
              aria-label={isPublished ? 'Unpublish' : 'Publish'}
            >
              <span aria-hidden="true" className="btn-icon__glyph">
                {isPublished ? '📤' : '📥'}
              </span>
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={() => openEditForm(item)}
              aria-label="Edit news"
            >
              <span aria-hidden="true" className="btn-icon__glyph">✏️</span>
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={() => onDeleteNews(item.id)}
              aria-label="Delete news"
            >
              <span aria-hidden="true" className="btn-icon__glyph">🗑️</span>
            </button>
          </td>
        </tr>
      )
    })
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">News management</h1>
          <p className="panel__subtitle">
            Coordinate publication, track drafts, and orchestrate newsroom output.
          </p>
        </div>
        <div className="panel__filters">
          <button className="btn btn--primary" type="button" onClick={openCreateForm}>
            + Add news
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            disabled={selectedCount === 0 || loading}
            onClick={() => onBulkAction('publish', selectedNewsIds)}
          >
            Publish selected
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            disabled={selectedCount === 0 || loading}
            onClick={() => onBulkAction('delete', selectedNewsIds)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="news-controls">
        <div className="news-controls__search">
          <label htmlFor="news-search" className="sr-only">
            Search news
          </label>
          <input
            id="news-search"
            type="search"
            placeholder="Search headlines, tags, or authors"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="news-controls__filters">
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange({ status: event.target.value, page: 1 })}
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(event) => onFiltersChange({ category: event.target.value, page: 1 })}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(event) => onFiltersChange({ sort: event.target.value, page: 1 })}
            aria-label="Sort results"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrapper" role="region" aria-live="polite">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all news"
                  checked={items.length > 0 && selectedNewsIds.length === items.length}
                  onChange={toggleSelectAll}
                  disabled={loading || !items.length}
                />
              </th>
              <th>Headline</th>
              <th>Status</th>
              <th>Category</th>
              <th>Created</th>
              <th>Views</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {pagination?.totalPages > 1 ? (
        <div className="table-pagination">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={loading || pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
             Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next 
          </button>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="drawer">
          <div className="drawer__content" role="dialog" aria-modal="true">
            <div className="drawer__header">
              <h2>{formMode === 'create' ? 'Add news' : 'Edit news'}</h2>
              <button
                type="button"
                className="btn-icon"
                aria-label="Close form"
                onClick={closeForm}
              >
                <span aria-hidden="true" className="btn-icon__glyph">×</span>
              </button>
            </div>
            <NewsForm
              key={editingItem ? editingItem.id : 'new'}
              categories={categories}
              initialData={editingItem}
              onCancel={closeForm}
              onSubmit={(values) => {
                if (formMode === 'create') {
                  onCreateNews(values)
                } else if (editingItem) {
                  onUpdateNews(editingItem.id, values)
                }
                closeForm()
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

NewsManager.propTypes = {
  news: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      category: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        color: PropTypes.string,
      }),
      categoryId: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      views: PropTypes.number,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
      scheduled: PropTypes.string,
    }),
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    }),
  ).isRequired,
  onCreateNews: PropTypes.func.isRequired,
  onUpdateNews: PropTypes.func.isRequired,
  onDeleteNews: PropTypes.func.isRequired,
  onBulkAction: PropTypes.func.isRequired,
  onTogglePublish: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    category: PropTypes.string,
    sort: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  selectedNewsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  externalCreateSignal: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.string,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number,
    totalPages: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
}

NewsManager.defaultProps = {
  externalCreateSignal: 0,
  loading: false,
  error: null,
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  onPageChange: () => {},
}

export default NewsManager
