import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    ArrowRight,
    Bookmark,
    BookmarkCheck,
    BriefcaseBusiness,
    CircleAlert,
    Clock3,
    Filter,
    IndianRupee,
    Layers3,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Star,
    UserRound,
    X,
} from 'lucide-react'
import { getProjects } from '../features/project/projectSlice'

const INITIAL_VISIBLE_PROJECTS = 9
const VISIBLE_PROJECTS_STEP = 6
const SAVED_PROJECTS_KEY = 'browse-projects:saved'

const SORT_OPTIONS = [
    { value: 'latest', label: 'Newest first' },
    { value: 'budget-desc', label: 'Budget: High to low' },
    { value: 'budget-asc', label: 'Budget: Low to high' },
    { value: 'duration-asc', label: 'Duration: Shortest first' },
]

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
]

const BUDGET_OPTIONS = [
    { value: 'all', label: 'Any budget' },
    { value: 'under-5000', label: 'Under Rs.5K' },
    { value: '5000-15000', label: 'Rs.5K - Rs.15K' },
    { value: '15000-30000', label: 'Rs.15K - Rs.30K' },
    { value: '30000-plus', label: 'Rs.30K+' },
]

const EXPERIENCE_OPTIONS = [
    { value: 'all', label: 'Any level' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Expert', label: 'Expert' },
]

const CATEGORY_STYLES = {
    'Web Development': {
        badge: 'border-blue-100 bg-blue-50 text-blue-700',
        glow: 'from-blue-500/15 via-cyan-500/10 to-transparent',
    },
    'UI/UX Design': {
        badge: 'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
        glow: 'from-fuchsia-500/15 via-violet-500/10 to-transparent',
    },
    'Backend Dev': {
        badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        glow: 'from-emerald-500/15 via-teal-500/10 to-transparent',
    },
    'Mobile Dev': {
        badge: 'border-orange-100 bg-orange-50 text-orange-700',
        glow: 'from-orange-500/15 via-amber-500/10 to-transparent',
    },
    'Data Science': {
        badge: 'border-sky-100 bg-sky-50 text-sky-700',
        glow: 'from-sky-500/15 via-cyan-500/10 to-transparent',
    },
    'Full Stack': {
        badge: 'border-rose-100 bg-rose-50 text-rose-700',
        glow: 'from-rose-500/15 via-pink-500/10 to-transparent',
    },
    WordPress: {
        badge: 'border-lime-100 bg-lime-50 text-lime-700',
        glow: 'from-lime-500/15 via-emerald-500/10 to-transparent',
    },
    'Graphic Design': {
        badge: 'border-amber-100 bg-amber-50 text-amber-700',
        glow: 'from-amber-500/15 via-orange-500/10 to-transparent',
    },
    'Content Writing': {
        badge: 'border-slate-200 bg-slate-100 text-slate-700',
        glow: 'from-slate-500/15 via-slate-400/10 to-transparent',
    },
    default: {
        badge: 'border-slate-200 bg-slate-100 text-slate-700',
        glow: 'from-slate-500/15 via-slate-400/10 to-transparent',
    },
}

const STATUS_STYLES = {
    pending: {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
    },
    accepted: {
        badge: 'border-violet-200 bg-violet-50 text-violet-700',
        dot: 'bg-violet-500',
    },
    'in-progress': {
        badge: 'border-blue-200 bg-blue-50 text-blue-700',
        dot: 'bg-blue-500',
    },
    completed: {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
    },
    rejected: {
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
        dot: 'bg-rose-500',
    },
}

const getStoredSavedProjects = () => {
    if (typeof window === 'undefined') {
        return []
    }

    try {
        const rawValue = window.localStorage.getItem(SAVED_PROJECTS_KEY)
        const parsedValue = rawValue ? JSON.parse(rawValue) : []
        return Array.isArray(parsedValue) ? parsedValue : []
    } catch {
        return []
    }
}

const formatCurrency = (value) => {
    const amount = Number(value) || 0
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
    }).format(amount)
}

const formatRelativeTime = (dateString) => {
    if (!dateString) {
        return 'Recently'
    }

    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.max(1, Math.floor(diff / 60000))

    if (minutes < 60) {
        return `${minutes}m ago`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return `${hours}h ago`
    }

    const days = Math.floor(hours / 24)
    if (days < 7) {
        return `${days}d ago`
    }

    const weeks = Math.floor(days / 7)
    if (weeks < 5) {
        return `${weeks}w ago`
    }

    const months = Math.floor(days / 30)
    return `${months}mo ago`
}

const getProjectSkills = (project) => {
    if (!project?.technology) {
        return []
    }

    return project.technology
        .split(/[,/]/)
        .map((skill) => skill.trim())
        .filter(Boolean)
}

const getProjectBudget = (project) => {
    return Number(project?.finalAmount ?? project?.budget ?? 0)
}

const getExperienceLevel = (project) => {
    const definedLevel = project?.level?.trim()
    if (definedLevel) {
        return definedLevel
    }

    const budget = getProjectBudget(project)
    if (budget >= 30000) {
        return 'Expert'
    }
    if (budget >= 12000) {
        return 'Intermediate'
    }
    return 'Beginner'
}

const matchesBudget = (project, budgetRange) => {
    const budget = getProjectBudget(project)

    if (budgetRange === 'all') {
        return true
    }
    if (budgetRange === 'under-5000') {
        return budget < 5000
    }
    if (budgetRange === '5000-15000') {
        return budget >= 5000 && budget <= 15000
    }
    if (budgetRange === '15000-30000') {
        return budget > 15000 && budget <= 30000
    }
    if (budgetRange === '30000-plus') {
        return budget > 30000
    }

    return true
}

const getCategoryOptions = (projects) => {
    const categories = projects
        .map((project) => project?.category)
        .filter(Boolean)

    return ['All', ...new Set(categories)]
}

const getPopularSkills = (projects) => {
    const skillFrequency = new Map()

    projects.forEach((project) => {
        getProjectSkills(project).forEach((skill) => {
            const count = skillFrequency.get(skill) || 0
            skillFrequency.set(skill, count + 1)
        })
    })

    return [...skillFrequency.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10)
        .map(([skill]) => skill)
}

const getAverageBudget = (projects) => {
    if (!projects.length) {
        return 0
    }

    const totalBudget = projects.reduce((sum, project) => sum + getProjectBudget(project), 0)
    return Math.round(totalBudget / projects.length)
}

const sortProjects = (projects, sortBy) => {
    const sortedProjects = [...projects]

    if (sortBy === 'budget-desc') {
        return sortedProjects.sort((left, right) => getProjectBudget(right) - getProjectBudget(left))
    }
    if (sortBy === 'budget-asc') {
        return sortedProjects.sort((left, right) => getProjectBudget(left) - getProjectBudget(right))
    }
    if (sortBy === 'duration-asc') {
        return sortedProjects.sort((left, right) => (left.duration || 0) - (right.duration || 0))
    }

    return sortedProjects.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
}

const countActiveFilters = ({ search, category, status, budgetRange, experienceLevel, selectedSkills }) => {
    let count = 0

    if (search.trim()) {
        count += 1
    }
    if (category !== 'All') {
        count += 1
    }
    if (status !== 'All') {
        count += 1
    }
    if (budgetRange !== 'all') {
        count += 1
    }
    if (experienceLevel !== 'all') {
        count += 1
    }

    return count + selectedSkills.length
}

const getBudgetFilterLabel = (value) => {
    return BUDGET_OPTIONS.find((option) => option.value === value)?.label || 'Budget'
}

const getStatusLabel = (value) => {
    return STATUS_OPTIONS.find((option) => option.value === value)?.label || value
}

const getCategoryStyle = (category) => {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES.default
}

const getStatusStyle = (status) => {
    return STATUS_STYLES[status] || STATUS_STYLES.pending
}

const matchesProjectFilters = (project, filters) => {
    const {
        search,
        category,
        status,
        budgetRange,
        experienceLevel,
        selectedSkills,
    } = filters

    const skills = getProjectSkills(project)
    const normalizedSearch = search.trim().toLowerCase()

    const matchesSearch = !normalizedSearch || [
        project?.title,
        project?.description,
        project?.technology,
        project?.category,
        project?.user?.name,
    ].some((field) => field?.toLowerCase().includes(normalizedSearch))

    const matchesCategory = category === 'All' || project?.category === category
    const matchesStatusValue = status === 'All' || project?.status === status
    const matchesExperienceLevel = experienceLevel === 'all' || getExperienceLevel(project) === experienceLevel
    const matchesSelectedSkills = !selectedSkills.length || selectedSkills.some((skill) => skills.includes(skill))

    return (
        matchesSearch &&
        matchesCategory &&
        matchesStatusValue &&
        matchesBudget(project, budgetRange) &&
        matchesExperienceLevel &&
        matchesSelectedSkills
    )
}

const BrowseSearchBar = ({
    search,
    onSearchChange,
    sortBy,
    onSortChange,
    activeFilterCount,
    onOpenFilters,
    resultCount,
    isRefreshing,
}) => {
    return (
        <div className="sticky top-16 z-30 border-y border-slate-200/70 bg-[#f5f7fb]/90 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Search by title, skill, category or client name"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                            <button
                                type="button"
                                onClick={onOpenFilters}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-slate-900 lg:hidden"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            <label className="relative col-span-2 sm:col-span-1">
                                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={sortBy}
                                    onChange={(event) => onSortChange(event.target.value)}
                                    className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 sm:min-w-52"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                            <Layers3 className="h-3.5 w-3.5 text-cyan-600" />
                            {resultCount} matching project{resultCount === 1 ? '' : 's'}
                        </span>

                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 font-semibold text-cyan-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active
                            </span>
                        )}

                        {isRefreshing && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Refreshing projects
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const FilterSection = ({ title, children }) => (
    <section className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            {title}
        </div>
        {children}
    </section>
)

const FilterPanel = ({
    categories,
    category,
    onCategoryChange,
    status,
    onStatusChange,
    budgetRange,
    onBudgetRangeChange,
    experienceLevel,
    onExperienceLevelChange,
    skills,
    selectedSkills,
    onToggleSkill,
    activeFilterCount,
    onClearFilters,
    onClose,
    isMobile = false,
}) => {
    return (
        <div className={`flex h-full flex-col gap-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] ${isMobile ? 'rounded-none border-0 shadow-none' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <div className="text-lg font-bold text-slate-900">Filters</div>
                    <p className="text-sm text-slate-500">Narrow projects with cleaner signals.</p>
                </div>

                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={onClearFilters}
                            className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800"
                        >
                            Clear all
                        </button>
                    )}

                    {isMobile && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <FilterSection title="Category">
                <div className="flex flex-wrap gap-2">
                    {categories.map((option) => {
                        const isActive = category === option

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => onCategoryChange(option)}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                    isActive
                                        ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                }`}
                            >
                                {option}
                            </button>
                        )
                    })}
                </div>
            </FilterSection>

            <FilterSection title="Budget">
                <div className="space-y-2">
                    {BUDGET_OPTIONS.map((option) => {
                        const isActive = budgetRange === option.value

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onBudgetRangeChange(option.value)}
                                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                                    isActive
                                        ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900'
                                }`}
                            >
                                <span>{option.label}</span>
                                {isActive && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
                            </button>
                        )
                    })}
                </div>
            </FilterSection>

            <FilterSection title="Experience Level">
                <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_OPTIONS.map((option) => {
                        const isActive = experienceLevel === option.value

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onExperienceLevelChange(option.value)}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                    isActive
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                }`}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </FilterSection>

            <FilterSection title="Status">
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((option) => {
                        const isActive = status === option.value

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onStatusChange(option.value)}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                    isActive
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                }`}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </FilterSection>

            <FilterSection title="Skills">
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => {
                            const isActive = selectedSkills.includes(skill)

                            return (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => onToggleSkill(skill)}
                                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                        isActive
                                            ? 'border-violet-200 bg-violet-50 text-violet-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    {skill}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                        Skills will appear here once projects include technology tags.
                    </div>
                )}
            </FilterSection>

            {isMobile && (
                <div className="mt-auto flex gap-3 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    )
}

const MetricCard = ({ label, value, accent }) => (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] backdrop-blur xl:p-5">
        <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${accent}`}>
            {label}
        </div>
        <div className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-[2rem]">
            {value}
        </div>
    </div>
)

const ProjectSkeleton = () => (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
                <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                <div className="h-6 w-52 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="mt-5 h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 flex flex-wrap gap-2">
            {[1, 2, 3].map((item) => (
                <div key={item} className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
            ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1.4rem] bg-slate-50 p-4">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="space-y-2">
                    <div className="h-3 w-14 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-4 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
            ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
                <div className="space-y-2">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-11 w-28 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-11 w-28 animate-pulse rounded-2xl bg-slate-100" />
            </div>
        </div>
    </div>
)

const ActiveFilterChip = ({ label, onClear }) => (
    <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
    >
        {label}
        <X className="h-3.5 w-3.5" />
    </button>
)

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_50px_-30px_rgba(15,23,42,0.22)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-100 text-slate-600">
            {icon}
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
        {actionLabel && onAction && (
            <button
                type="button"
                onClick={onAction}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
                {actionLabel}
            </button>
        )}
    </div>
)

const ProjectCard = ({ project, isSaved, onToggleSave }) => {
    const categoryStyle = getCategoryStyle(project.category)
    const statusStyle = getStatusStyle(project.status)
    const skills = getProjectSkills(project).slice(0, 5)
    const clientRating = Number(project.user?.averageRating || 0)
    const clientReviewCount = Number(project.user?.totalRatings || 0)
    const experienceLevel = getExperienceLevel(project)
    const budget = getProjectBudget(project)
    const clientName = project.user?.name || 'Client'
    const clientInitials = clientName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <article
            className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_28px_70px_-34px_rgba(8,145,178,0.3)]"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '460px' }}
        >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${categoryStyle.glow} opacity-0 transition duration-300 group-hover:opacity-100`} />

            <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${categoryStyle.badge}`}>
                            {project.category || 'General'}
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyle.badge}`}>
                            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                            {getStatusLabel(project.status)}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                            {experienceLevel}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold leading-tight text-slate-950 sm:text-xl">
                        {project.title}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={() => onToggleSave(project._id)}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                        isSaved
                            ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                    aria-label={isSaved ? 'Remove project from saved list' : 'Save project'}
                >
                    {isSaved ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
                </button>
            </div>

            <p className="relative mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {project.description || 'No project description added yet.'}
            </p>

            {skills.length > 0 && (
                <div className="relative mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            <div className="relative mt-5 grid grid-cols-2 gap-3 rounded-[1.4rem] border border-slate-100 bg-slate-50/80 p-4">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Budget
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-lg font-black text-slate-950">
                        <IndianRupee className="h-4 w-4 text-emerald-600" />
                        {formatCurrency(budget)}
                    </div>
                </div>

                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Delivery
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">
                        {project.duration ? `${project.duration} days` : 'Flexible'}
                    </div>
                </div>

                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Posted
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        {formatRelativeTime(project.createdAt)}
                    </div>
                </div>

                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Status
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-700">
                        {project.status === 'in-progress' ? 'Project moving' : getStatusLabel(project.status)}
                    </div>
                </div>
            </div>

            <div className="relative mt-5 flex flex-1 flex-col justify-end border-t border-slate-100 pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                            {clientInitials || 'CL'}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{clientName}</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Verified
                                </span>
                            </div>

                            {clientReviewCount > 0 ? (
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                                        <Star className="h-4 w-4 fill-current" />
                                        {clientRating.toFixed(1)}
                                    </span>
                                    <span className="text-slate-400">({clientReviewCount} reviews)</span>
                                </div>
                            ) : (
                                <div className="mt-1 text-sm text-slate-500">
                                    New client profile
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                            to={`/project/${project._id}`}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            View Details
                        </Link>
                        <Link
                            to={`/project/${project._id}`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Open Project
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    )
}

const ProjectResultsGrid = ({ projects, savedProjectIds, onToggleSave }) => {
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PROJECTS)
    const loadMoreRef = useRef(null)

    const visibleProjects = projects.slice(0, visibleCount)
    const hasMoreProjects = visibleProjects.length < projects.length

    useEffect(() => {
        if (!hasMoreProjects || !loadMoreRef.current) {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (!entry?.isIntersecting) {
                    return
                }

                setVisibleCount((currentValue) => Math.min(currentValue + VISIBLE_PROJECTS_STEP, projects.length))
            },
            { rootMargin: '260px 0px' }
        )

        observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [hasMoreProjects, projects.length])

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleProjects.map((project) => (
                    <ProjectCard
                        key={project._id}
                        project={project}
                        isSaved={savedProjectIds.includes(project._id)}
                        onToggleSave={onToggleSave}
                    />
                ))}
            </div>

            {hasMoreProjects && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <div ref={loadMoreRef} className="h-1 w-full" />
                    <button
                        type="button"
                        onClick={() => setVisibleCount((currentValue) => Math.min(currentValue + VISIBLE_PROJECTS_STEP, projects.length))}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        Load more projects
                    </button>
                </div>
            )}
        </>
    )
}

const BrowseProjects = () => {
    const dispatch = useDispatch()
    const { listedProjects, projectLoading, projectError, projectErrorMessage } = useSelector((state) => state.project)
    const { user } = useSelector((state) => state.auth)

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [status, setStatus] = useState('All')
    const [budgetRange, setBudgetRange] = useState('all')
    const [experienceLevel, setExperienceLevel] = useState('all')
    const [selectedSkills, setSelectedSkills] = useState([])
    const [sortBy, setSortBy] = useState('latest')
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [savedProjectIds, setSavedProjectIds] = useState(() => getStoredSavedProjects())

    const deferredSearch = useDeferredValue(search)

    useEffect(() => {
        if (user?._id) {
            dispatch(getProjects())
        }
    }, [dispatch, user?._id])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(savedProjectIds))
    }, [savedProjectIds])

    const allProjects = Array.isArray(listedProjects)
        ? listedProjects.filter((project) => project.user?._id === user?._id)
        : []

    const categoryOptions = getCategoryOptions(allProjects)
    const popularSkills = getPopularSkills(allProjects)

    const filteredProjects = sortProjects(
        allProjects.filter((project) => matchesProjectFilters(project, {
            search: deferredSearch,
            category,
            status,
            budgetRange,
            experienceLevel,
            selectedSkills,
        })),
        sortBy
    )
    const activeFilterCount = countActiveFilters({
        search,
        category,
        status,
        budgetRange,
        experienceLevel,
        selectedSkills,
    })

    const isEmptyResponse = projectError && /project not found/i.test(projectErrorMessage || '')
    const showInitialLoading = projectLoading && !allProjects.length && !projectError
    const showErrorState = projectError && !isEmptyResponse && !allProjects.length
    const filterStateKey = [
        deferredSearch,
        category,
        status,
        budgetRange,
        experienceLevel,
        sortBy,
        selectedSkills.join('|'),
    ].join('::')

    const toggleSavedProject = (projectId) => {
        setSavedProjectIds((currentValue) => (
            currentValue.includes(projectId)
                ? currentValue.filter((id) => id !== projectId)
                : [...currentValue, projectId]
        ))
    }

    const toggleSkill = (skill) => {
        setSelectedSkills((currentValue) => (
            currentValue.includes(skill)
                ? currentValue.filter((item) => item !== skill)
                : [...currentValue, skill]
        ))
    }

    const clearFilters = () => {
        setSearch('')
        setCategory('All')
        setStatus('All')
        setBudgetRange('all')
        setExperienceLevel('all')
        setSelectedSkills([])
        setSortBy('latest')
    }

    const metrics = [
        {
            label: 'Projects live',
            value: allProjects.length,
            accent: 'bg-cyan-50 text-cyan-700',
        },
        {
            label: 'Open now',
            value: allProjects.filter((project) => ['pending', 'accepted', 'in-progress'].includes(project.status)).length,
            accent: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Avg budget',
            value: `Rs.${formatCurrency(getAverageBudget(allProjects))}`,
            accent: 'bg-violet-50 text-violet-700',
        },
        {
            label: 'Saved',
            value: savedProjectIds.length,
            accent: 'bg-amber-50 text-amber-700',
        },
    ]

    if (!user) {
        return (
            <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pt-20">
                <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
                    <EmptyState
                        icon={<UserRound className="h-7 w-7" />}
                        title="Sign in to view your project board"
                        message="Browse Projects currently shows your posted work, active budget signals, and cleaner project management filters after login."
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pt-20 text-slate-900">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-200/25 blur-3xl" />
                <div className="absolute left-0 top-1/3 h-[26rem] w-[26rem] rounded-full bg-blue-200/20 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-emerald-200/20 blur-3xl" />
            </div>

            <section className="relative overflow-hidden border-b border-slate-200/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(239,246,255,0.9),_rgba(245,247,251,0.95))]" />
                <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 lg:px-8">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            Premium project browsing
                        </span>

                        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Browse projects with a sharper, faster project board
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                            A cleaner way to scan budget, client trust, delivery timeline, and category signals without the clutter.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <MetricCard
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                accent={metric.accent}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <BrowseSearchBar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                activeFilterCount={activeFilterCount}
                onOpenFilters={() => setMobileFiltersOpen(true)}
                resultCount={filteredProjects.length}
                isRefreshing={projectLoading && allProjects.length > 0}
            />

            <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-32">
                            <FilterPanel
                                categories={categoryOptions}
                                category={category}
                                onCategoryChange={setCategory}
                                status={status}
                                onStatusChange={setStatus}
                                budgetRange={budgetRange}
                                onBudgetRangeChange={setBudgetRange}
                                experienceLevel={experienceLevel}
                                onExperienceLevelChange={setExperienceLevel}
                                skills={popularSkills}
                                selectedSkills={selectedSkills}
                                onToggleSkill={toggleSkill}
                                activeFilterCount={activeFilterCount}
                                onClearFilters={clearFilters}
                            />
                        </div>
                    </aside>

                    <div className="space-y-5">
                        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.22)]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                                        <BriefcaseBusiness className="h-3.5 w-3.5 text-cyan-600" />
                                        Result overview
                                    </div>
                                    <h2 className="mt-3 text-xl font-bold text-slate-950">
                                        {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} matching your current view
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Mobile-first grid, sticky controls, and cleaner project signals for faster decisions.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {search.trim() && (
                                        <ActiveFilterChip label={`Search: ${search.trim()}`} onClear={() => setSearch('')} />
                                    )}
                                    {category !== 'All' && (
                                        <ActiveFilterChip label={category} onClear={() => setCategory('All')} />
                                    )}
                                    {status !== 'All' && (
                                        <ActiveFilterChip label={getStatusLabel(status)} onClear={() => setStatus('All')} />
                                    )}
                                    {budgetRange !== 'all' && (
                                        <ActiveFilterChip label={getBudgetFilterLabel(budgetRange)} onClear={() => setBudgetRange('all')} />
                                    )}
                                    {experienceLevel !== 'all' && (
                                        <ActiveFilterChip label={experienceLevel} onClear={() => setExperienceLevel('all')} />
                                    )}
                                    {selectedSkills.map((skill) => (
                                        <ActiveFilterChip
                                            key={skill}
                                            label={skill}
                                            onClear={() => toggleSkill(skill)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {showInitialLoading && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }, (_, index) => (
                                    <ProjectSkeleton key={index} />
                                ))}
                            </div>
                        )}

                        {showErrorState && (
                            <EmptyState
                                icon={<CircleAlert className="h-7 w-7" />}
                                title="We couldn’t load your projects"
                                message={projectErrorMessage || 'Please try again in a moment.'}
                                actionLabel="Retry"
                                onAction={() => dispatch(getProjects())}
                            />
                        )}

                        {!showInitialLoading && !showErrorState && allProjects.length === 0 && !isEmptyResponse && (
                            <EmptyState
                                icon={<Layers3 className="h-7 w-7" />}
                                title="No projects posted yet"
                                message="Once you post projects, this board will give you a cleaner browsing and management view with filters, saved items, and faster scanning."
                            />
                        )}

                        {!showInitialLoading && !showErrorState && isEmptyResponse && (
                            <EmptyState
                                icon={<Layers3 className="h-7 w-7" />}
                                title="No projects available yet"
                                message="Projects will appear here as soon as they are created. The layout is ready for live listings, filters, and quick detail access."
                            />
                        )}

                        {!showInitialLoading && !showErrorState && allProjects.length > 0 && filteredProjects.length === 0 && (
                            <EmptyState
                                icon={<Filter className="h-7 w-7" />}
                                title="No projects match these filters"
                                message="Try broadening the search, removing a few filters, or resetting the board for a wider view."
                                actionLabel="Clear filters"
                                onAction={clearFilters}
                            />
                        )}

                        {!showInitialLoading && !showErrorState && filteredProjects.length > 0 && (
                            <ProjectResultsGrid
                                key={filterStateKey}
                                projects={filteredProjects}
                                savedProjectIds={savedProjectIds}
                                onToggleSave={toggleSavedProject}
                            />
                        )}
                    </div>
                </div>
            </main>

            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden">
                    <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
                        <FilterPanel
                            categories={categoryOptions}
                            category={category}
                            onCategoryChange={setCategory}
                            status={status}
                            onStatusChange={setStatus}
                            budgetRange={budgetRange}
                            onBudgetRangeChange={setBudgetRange}
                            experienceLevel={experienceLevel}
                            onExperienceLevelChange={setExperienceLevel}
                            skills={popularSkills}
                            selectedSkills={selectedSkills}
                            onToggleSkill={toggleSkill}
                            activeFilterCount={activeFilterCount}
                            onClearFilters={clearFilters}
                            onClose={() => setMobileFiltersOpen(false)}
                            isMobile
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default BrowseProjects
