import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import RichTextEditor from './RichTextEditor.jsx'

const defaultValues = {
  headline: '',
  excerpt: '',
  categoryId: '',
  status: 'draft',
  tags: [],
  coverImage: '',
  content: '',
  scheduled: false,
  scheduledAt: '',
}

const NewsForm = ({ initialData, categories, onCancel, onSubmit }) => {
  const mergedDefaults = useMemo(() => {
    if (!initialData) {
      return {
        ...defaultValues,
        categoryId: categories[0]?.id ?? '',
      }
    }

    const normalizedTags = Array.isArray(initialData.tags)
      ? initialData.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))
      : []
    const scheduledSource = initialData.scheduled ?? initialData.scheduledAt ?? null

    return {
      ...defaultValues,
      headline: initialData.title ?? initialData.headline ?? '',
      excerpt: initialData.excerpt ?? initialData.summary ?? '',
      categoryId:
        initialData.categoryId ?? initialData.category?.id ?? categories[0]?.id ?? '',
      status: initialData.status ?? 'draft',
      tags: normalizedTags,
      coverImage: initialData.heroImageUrl ?? initialData.coverImage ?? '',
      content: initialData.contentHtml ?? initialData.content ?? '',
      scheduled: Boolean(scheduledSource),
      scheduledAt: scheduledSource
        ? new Date(scheduledSource).toISOString().slice(0, 16)
        : '',
    }
  }, [initialData, categories])

  const [formValues, setFormValues] = useState(mergedDefaults)
  const [tagInput, setTagInput] = useState('')
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImage ?? '')

  const updateForm = (changes) => {
    setFormValues((prev) => ({ ...prev, ...changes }))
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const normalized = tagInput.trim().toLowerCase()
    if (formValues.tags.includes(normalized)) {
      setTagInput('')
      return
    }
    updateForm({ tags: [...formValues.tags, normalized] })
    setTagInput('')
  }

  const handleRemoveTag = (tag) => {
    updateForm({ tags: formValues.tags.filter((item) => item !== tag) })
  }

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleAddTag()
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      setCoverPreview(loadEvent.target?.result ?? '')
      updateForm({ coverImage: loadEvent.target?.result ?? '' })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...formValues,
      excerpt: formValues.excerpt,
      scheduled: formValues.scheduled
        ? new Date(formValues.scheduledAt).toISOString()
        : null,
    }
    onSubmit(payload)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__group">
        <label htmlFor="headline">Headline</label>
        <input
          id="headline"
          type="text"
          value={formValues.headline}
          onChange={(event) => updateForm({ headline: event.target.value })}
          placeholder="Enter headline"
          required
        />
      </div>

      <div className="form__group">
        <label htmlFor="excerpt">Summary</label>
        <textarea
          id="excerpt"
          value={formValues.excerpt}
          onChange={(event) => updateForm({ excerpt: event.target.value })}
          placeholder="Write a short summary for listings and SEO"
          rows={3}
          required
        />
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={formValues.categoryId}
            onChange={(event) => updateForm({ categoryId: event.target.value })}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form__group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formValues.status}
            onChange={(event) => updateForm({ status: event.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="form__group">
        <label>Cover image</label>
        <div className="form__file">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {coverPreview ? (
            <img src={coverPreview} alt="" className="form__file-preview" />
          ) : (
            <p className="form__file-placeholder">
              Upload feature image (JPG, PNG). Recommended 1280×720.
            </p>
          )}
        </div>
      </div>

      <div className="form__group">
        <label>Story body</label>
        <RichTextEditor
          value={formValues.content}
          onChange={(value) => updateForm({ content: value })}
        />
      </div>

      <div className="form__group">
        <label htmlFor="tags">Tags</label>
        <div className="form__tags">
          <div className="form__tag-list">
            {formValues.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="tag-chip"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                #{tag} ✕
              </button>
            ))}
          </div>
          <div className="form__tag-input">
            <input
              id="tags"
              type="text"
              placeholder="Add tag and press enter"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleAddTag}
            />
          </div>
        </div>
      </div>

      <fieldset className="form__group form__group--inline">
        <legend>Publish options</legend>
        <label className="form__switch">
          <input
            type="checkbox"
            checked={formValues.status === 'published'}
            onChange={(event) =>
              updateForm({ status: event.target.checked ? 'published' : 'draft' })
            }
          />
          <span>Publish immediately</span>
        </label>
        <label className="form__switch">
          <input
            type="checkbox"
            checked={formValues.scheduled}
            onChange={(event) =>
              updateForm({
                scheduled: event.target.checked,
                scheduledAt: event.target.checked
                  ? formValues.scheduledAt || new Date().toISOString().slice(0, 16)
                  : '',
              })
            }
          />
          <span>Schedule publish</span>
        </label>
        {formValues.scheduled ? (
          <input
            type="datetime-local"
            value={formValues.scheduledAt}
            onChange={(event) => updateForm({ scheduledAt: event.target.value })}
            aria-label="Scheduled publish date"
          />
        ) : null}
      </fieldset>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          {initialData ? 'Save changes' : 'Create news'}
        </button>
      </div>
    </form>
  )
}

NewsForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.string,
    headline: PropTypes.string,
    categoryId: PropTypes.string,
    status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    coverImage: PropTypes.string,
    content: PropTypes.string,
    scheduled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.object]),
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

NewsForm.defaultProps = {
  initialData: undefined,
}

export default NewsForm

