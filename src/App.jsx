import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import NewsManager from './components/NewsManager.jsx'
import CategoriesManager from './components/CategoriesManager.jsx'
import UsersManager from './components/UsersManager.jsx'
import Analytics from './components/Analytics.jsx'
import Settings from './components/Settings.jsx'
import NotificationCenter from './components/NotificationCenter.jsx'
import { fetchCategories as fetchCategoriesApi } from './api/categories.js'
import {
  fetchNews as fetchNewsApi,
  createArticle as createArticleApi,
  updateArticle as updateArticleApi,
  deleteArticle as deleteArticleApi,
  publishArticle as publishArticleApi,
  unpublishArticle as unpublishArticleApi,
  bulkActionArticles as bulkActionArticlesApi,
} from './api/news.js'
import { initialCategories, initialUsers } from './data/mockData.js'
import './index.css'

const defaultFilters = {
  search: '',
  status: 'all',
  category: 'all',
  sort: 'newest',
  page: 1,
  pageSize: 10,
}

const defaultPreferences = {
  emailAlerts: true,
  assignmentReminders: true,
  weeklyDigest: false,
  requireTwoFactor: true,
  autoArchiveDrafts: false,
  requireEditorApproval: true,
}

const performanceSnapshot = {
  funnel: [
    { label: 'Page view', value: 100 },
    { label: 'Read 50%', value: 72 },
    { label: 'Completed article', value: 48 },
    { label: 'Subscribed', value: 16 },
  ],
  topCategories: [
    { name: 'Top Stories', value: 32 },
    { name: 'Tech', value: 24 },
    { name: 'Politics', value: 18 },
    { name: 'Sports', value: 16 },
    { name: 'Entertainment', value: 10 },
  ],
  retention: [
    { cohort: 'Mon', values: [100, 78, 60, 42, 30] },
    { cohort: 'Tue', values: [100, 74, 53, 36, 21] },
    { cohort: 'Wed', values: [100, 81, 64, 45, 29] },
    { cohort: 'Thu', values: [100, 69, 48, 31, 18] },
    { cohort: 'Fri', values: [100, 66, 44, 27, 15] },
  ],
}

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

function App() {
  const [theme, setTheme] = useState('light')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [news, setNews] = useState([])
  const [newsMeta, setNewsMeta] = useState({
    page: defaultFilters.page,
    pageSize: defaultFilters.pageSize,
    total: 0,
    totalPages: 1,
  })
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState(null)
  const [users, setUsers] = useState(initialUsers)
  const [newsFilters, setNewsFilters] = useState(defaultFilters)
  const [selectedNewsIds, setSelectedNewsIds] = useState([])
  const [notifications, setNotifications] = useState([])
  const [globalSearch, setGlobalSearch] = useState('')
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [createNewsSignal, setCreateNewsSignal] = useState(0)

  const transformArticle = useCallback((article) => ({
    id: article.id,
    title: article.title,
    headline: article.title,
    status: article.status,
    categoryId: article.category?.id ?? '',
    category: article.category ?? null,
    tags: (article.tags ?? []).map((tag) => tag.name),
    tagObjects: article.tags ?? [],
    views: article.viewCount ?? 0,
    author: article.author?.name ?? '—',
    authorId: article.author?.id ?? null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    publishedAt: article.publishedAt,
    scheduled: article.scheduledAt,
    slug: article.slug,
    excerpt: article.excerpt,
    contentHtml: article.contentHtml,
    heroImageUrl: article.heroImageUrl,
  }), [])

  const sortArticles = useCallback((list, sortKey) => {
    const sorted = [...list]
    switch (sortKey) {
      case 'oldest':
        sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        break
      case 'views':
        sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        break
      case 'alphabetical':
        sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
        break
      case 'newest':
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
    }
    return sorted
  }, [])

  const notify = useCallback((message, variant = 'success', detail) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: createId('toast'),
        message,
        variant,
        detail,
      },
    ])
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    let isMounted = true
    const loadCategories = async () => {
      try {
        const remoteCategories = await fetchCategoriesApi()
        if (isMounted && remoteCategories.length) {
          setCategories(remoteCategories)
        }
      } catch (error) {
        notify(error.message ?? 'Failed to load categories', 'error')
      }
    }
    loadCategories()
    return () => {
      isMounted = false
    }
  }, [notify])

  const refreshInFlightRef = useRef(false)

  const refreshNews = useCallback(
    async (options = {}) => {
      const { silent = false, preserveSelection = false, overrides = {} } = options
      const effectiveFilters = { ...newsFilters, ...overrides }

      if (refreshInFlightRef.current) {
        if (silent) {
          return
        }
      }

      if (!silent) {
        setNewsLoading(true)
      }
      refreshInFlightRef.current = true
      try {
        const params = {
          page: effectiveFilters.page,
          pageSize: effectiveFilters.pageSize,
          status: effectiveFilters.status !== 'all' ? effectiveFilters.status : undefined,
          categoryId: effectiveFilters.category !== 'all' ? effectiveFilters.category : undefined,
          search: effectiveFilters.search || undefined,
        }
        const { items, pagination } = await fetchNewsApi(params)
        const mapped = items.map(transformArticle)
        const sorted = sortArticles(mapped, effectiveFilters.sort)
        const metaPage = pagination.page ?? params.page ?? 1
        const metaPageSize =
          pagination.pageSize ??
          params.pageSize ??
          effectiveFilters.pageSize ??
          (sorted.length || defaultFilters.pageSize)
        const metaTotal = pagination.total ?? sorted.length
        const metaTotalPages = pagination.totalPages ?? Math.max(1, Math.ceil(metaTotal / metaPageSize))

        setNews(sorted)
        setNewsMeta({
          page: metaPage,
          pageSize: metaPageSize,
          total: metaTotal,
          totalPages: metaTotalPages,
        })
        setNewsError(null)
        if (!preserveSelection) {
          setSelectedNewsIds([])
        }
      } catch (error) {
        const message = error.message ?? 'Failed to load news'
        setNewsError(message)
        if (!silent) {
          notify(message, 'error')
        }
      } finally {
        refreshInFlightRef.current = false
        if (!silent) {
          setNewsLoading(false)
        }
      }
    },
    [newsFilters, notify, sortArticles, transformArticle],
  )

  useEffect(() => {
    refreshNews()
  }, [refreshNews])

  useEffect(() => {
    const interval = setInterval(() => {
      refreshNews({ silent: true, preserveSelection: true })
    }, 30000)
    return () => clearInterval(interval)
  }, [refreshNews])

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleCreateNews = useCallback(
    async (payload) => {
      const tempId = `temp-${Date.now()}`
      const nowIso = new Date().toISOString()
      const optimisticArticle = {
        id: tempId,
        title: payload.title ?? payload.headline ?? '',
        headline: payload.title ?? payload.headline ?? '',
        status: payload.status ?? 'draft',
        categoryId: payload.categoryId,
        category: categories.find((category) => category.id === payload.categoryId) ?? null,
        tags: Array.isArray(payload.tags)
          ? payload.tags.map((tag) => (typeof tag === 'string' ? tag : String(tag))).filter(Boolean)
          : [],
        views: 0,
        author: '—',
        authorId: null,
        createdAt: nowIso,
        updatedAt: nowIso,
        publishedAt: payload.status === 'published' ? nowIso : null,
        scheduled: payload.scheduledAt ?? null,
        slug: '',
        excerpt: payload.excerpt ?? '',
        contentHtml: payload.contentHtml ?? payload.content ?? '',
        heroImageUrl: payload.heroImageUrl ?? payload.coverImage ?? '',
      }

      setNews((prev) => {
        const withoutTemp = prev.filter((item) => item.id !== tempId)
        const combined = [optimisticArticle, ...withoutTemp]
        return sortArticles(combined, newsFilters.sort)
      })

      setNewsMeta((prev) => {
        const pageSize = prev.pageSize || defaultFilters.pageSize
        const nextTotal = (prev.total ?? 0) + 1
        return {
          ...prev,
          page: 1,
          total: nextTotal,
          totalPages: Math.max(1, Math.ceil(nextTotal / pageSize)),
        }
      })

      setNewsFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }))

      try {
        const created = await createArticleApi(payload)
        notify('News created successfully', 'success')

        setNews((prev) => {
          const transformed = transformArticle(created)
          const filtered = prev.filter((item) => item.id !== tempId && item.id !== transformed.id)
          const combined = [transformed, ...filtered]
          return sortArticles(combined, newsFilters.sort)
        })

        await refreshNews({ silent: true, overrides: { page: 1 }, preserveSelection: false })
      } catch (error) {
        setNews((prev) => prev.filter((item) => item.id !== tempId))
        setNewsMeta((prev) => {
          const pageSize = prev.pageSize || defaultFilters.pageSize
          const nextTotal = Math.max((prev.total ?? 1) - 1, 0)
          return {
            ...prev,
            total: nextTotal,
            totalPages: Math.max(1, Math.ceil(Math.max(nextTotal, 1) / pageSize)),
          }
        })

        notify(error.message ?? 'Failed to create news', 'error')
      }
    },
    [categories, newsFilters.sort, notify, refreshNews, sortArticles, transformArticle],
  )

  const handleUpdateNews = useCallback(
    async (id, payload) => {
      try {
        await updateArticleApi(id, payload)
        notify('News updated', 'success')
        await refreshNews()
      } catch (error) {
        notify(error.message ?? 'Failed to update news', 'error')
      }
    },
    [notify, refreshNews],
  )

  const handleDeleteNews = useCallback(
    async (id) => {
      try {
        await deleteArticleApi(id)
        notify('News deleted', 'info')
        await refreshNews()
      } catch (error) {
        notify(error.message ?? 'Failed to delete news', 'error')
      }
    },
    [notify, refreshNews],
  )

  const handleBulkAction = useCallback(
    async (action, ids) => {
      if (!ids.length) return
      try {
        await bulkActionArticlesApi({ action, articleIds: ids })
        notify(
          action === 'delete'
            ? 'Selected news deleted'
            : action === 'publish'
              ? 'Selected news published'
              : 'Bulk action completed',
          action === 'delete' ? 'warning' : 'success',
        )
        await refreshNews()
      } catch (error) {
        notify(error.message ?? 'Bulk action failed', 'error')
      }
    },
    [notify, refreshNews],
  )

  const handleTogglePublish = useCallback(
    async (id, status) => {
      try {
        if (status === 'published') {
          await unpublishArticleApi(id)
          notify('Article moved back to draft', 'info')
        } else {
          await publishArticleApi(id)
          notify('Article published', 'success')
        }
        await refreshNews()
      } catch (error) {
        notify(error.message ?? 'Failed to change publish status', 'error')
      }
    },
    [notify, refreshNews],
  )

  const handleNewsFiltersChange = useCallback((changes) => {
    setNewsFilters((prev) => {
      const next = { ...prev, ...changes }
      const shouldResetPage =
        ('status' in changes && changes.status !== prev.status) ||
        ('category' in changes && changes.category !== prev.category) ||
        ('search' in changes && changes.search !== prev.search) ||
        ('sort' in changes && changes.sort !== prev.sort)
      if ('page' in changes) {
        next.page = changes.page
      } else if (shouldResetPage) {
        next.page = 1
      }
      if ('pageSize' in changes && changes.pageSize !== prev.pageSize) {
        next.pageSize = changes.pageSize
      }
      return next
    })
  }, [])

  const handleCreateCategory = (payload) => {
    const tempId = createId('cat-temp')
    const optimisticCategory = {
      id: tempId,
      name: payload.name,
      color: payload.color ?? '#3a7dff',
      description: payload.description ?? '',
    }

    setCategories((prev) => [optimisticCategory, ...prev])
    notify('Category created', 'success')

    createCategoryApi(payload)
      .then((created) => {
        setCategories((prev) => {
          const filtered = prev.filter((category) => category.id !== tempId && category.id !== created.id)
          return [created, ...filtered]
        })
      })
      .catch((error) => {
        setCategories((prev) => prev.filter((category) => category.id !== tempId))
        notify(error.message ?? 'Failed to create category', 'error')
      })
  }

  const handleUpdateCategory = (id, payload) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === id ? { ...category, ...payload } : category)),
    )
    notify('Category updated', 'success')
  }

  const handleDeleteCategory = (id) => {
    const remaining = categories.filter((category) => category.id !== id)
    let fallbackCategory = remaining[0]?.id ?? null
    let fallbackName = remaining[0]?.name ?? null

    if (!fallbackCategory) {
      const unassigned = {
        id: createId('cat'),
        name: 'Unassigned',
        color: '#6c7a99',
        description: 'Content awaiting categorisation.',
      }
      remaining.push(unassigned)
      fallbackCategory = unassigned.id
      fallbackName = unassigned.name
    }

    setCategories(remaining)
    setNews((prev) =>
      prev.map((item) =>
        item.categoryId === id
          ? { ...item, categoryId: fallbackCategory ?? item.categoryId }
          : item,
      ),
    )
    notify(
      'Category removed',
      'warning',
      fallbackName
        ? `Stories were reassigned to ${fallbackName}.`
        : 'Stories keep their current grouping until reassigned.',
    )
  }

  const handleInviteUser = ({ name, email, role }) => {
    setUsers((prev) => [
      ...prev,
      {
        id: createId('user'),
        name,
        email,
        role,
        status: 'Invited',
        lastLogin: null,
      },
    ])
    notify('Invite sent', 'success', `${name} will receive login instructions.`)
  }

  const handleUpdateRole = (id, role) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role } : user)),
    )
    notify('Role updated', 'success')
  }

  const handleToggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === 'Suspended' ? 'Active' : 'Suspended',
            }
          : user,
      ),
    )
    notify('User status changed', 'info')
  }

  const newsCountByCategory = useMemo(
    () =>
      news.reduce((acc, item) => {
        acc[item.categoryId] = (acc[item.categoryId] ?? 0) + 1
        return acc
      }, {}),
    [news],
  )

  const recentDrafts = useMemo(
    () =>
      news
        .filter((item) => item.status !== 'published')
        .slice(0, 4),
    [news],
  )

  const topContributors = useMemo(
    () =>
      users
        .filter((user) => ['Journalist', 'Editor'].includes(user.role))
        .map((user) => ({
          ...user,
          published: Math.floor(Math.random() * 40) + 5,
          trend: Math.floor(Math.random() * 14) - 2,
        }))
        .slice(0, 4),
    [users],
  )

  const handleGlobalSearch = (value) => {
    setGlobalSearch(value)
    handleNewsFiltersChange({ search: value, page: 1 })
    if (activeSection !== 'news') {
      setActiveSection('news')
    }
  }

  const sectionContent = (() => {
    switch (activeSection) {
      case 'news':
        return (
          <NewsManager
            news={news}
            categories={categories}
            onCreateNews={handleCreateNews}
            onUpdateNews={handleUpdateNews}
            onDeleteNews={handleDeleteNews}
            onBulkAction={handleBulkAction}
            onTogglePublish={handleTogglePublish}
            filters={newsFilters}
            onFiltersChange={handleNewsFiltersChange}
            selectedNewsIds={selectedNewsIds}
            onSelectionChange={setSelectedNewsIds}
            externalCreateSignal={createNewsSignal}
            loading={newsLoading}
            error={newsError}
            pagination={newsMeta}
            onPageChange={(page) => handleNewsFiltersChange({ page })}
          />
        )
      case 'categories':
        return (
          <CategoriesManager
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            newsCountByCategory={newsCountByCategory}
          />
        )
      case 'users':
        return (
          <UsersManager
            users={users}
            onInviteUser={handleInviteUser}
            onUpdateRole={handleUpdateRole}
            onToggleStatus={handleToggleUserStatus}
          />
        )
      case 'analytics':
        return <Analytics performance={performanceSnapshot} />
      case 'settings':
        return (
          <Settings
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        )
      case 'dashboard':
      default:
        return (
          <Dashboard
            recentNews={recentDrafts}
            topContributors={topContributors}
          />
        )
    }
  })()

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(section) => {
          setActiveSection(section)
          setIsSidebarCollapsed(false)
        }}
        collapsed={isSidebarCollapsed}
        onCollapseToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        notifications={notifications}
      />

      <div className="shell-main">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          globalSearch={globalSearch}
          onGlobalSearch={handleGlobalSearch}
          onOpenQuickAdd={() => {
            setActiveSection('news')
            setCreateNewsSignal((prev) => prev + 1)
          }}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <main className="shell-content">{sectionContent}</main>
      </div>

      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
      </div>
  )
}

export default App
