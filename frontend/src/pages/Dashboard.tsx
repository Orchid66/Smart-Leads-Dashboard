import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Lead, PaginationInfo, LeadStats } from '../types'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import LeadForm from '../components/LeadForm'
import Filters from '../components/Filters'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'

const Dashboard = () => {
  const { user } = useAuth()

  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form/Modal state
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1) // current page

  // Debounce the search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch leads whenever filters or page changes
  useEffect(() => {
    fetchLeads()
  }, [debouncedSearch, status, source, sort, page])

  // Fetch stats once on mount
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { page, limit: 10, sort }
      if (debouncedSearch) params.search = debouncedSearch
      if (status) params.status = status
      if (source) params.source = source

      const res = await api.get('/leads', { params })
      setLeads(res.data.leads)
      setPagination(res.data.pagination)
    } catch {
      setError('Could not load leads. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/leads/stats')
      setStats(res.data)
    } catch {
      // Stats are not critical, just skip if it fails
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return
    try {
      await api.delete(`/leads/${id}`)
      fetchLeads()
      fetchStats()
    } catch {
      alert('Failed to delete lead')
    }
  }

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/leads/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `leads_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export CSV')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingLead(null)
    fetchLeads()
    fetchStats()
  }

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead)
    setShowForm(true)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setSource('')
    setSort('latest')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.role === 'admin' ? 'Viewing all leads' : 'Viewing your leads'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">New</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.New}</p>
            </div>
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Contacted</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.Contacted}</p>
            </div>
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Qualified</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.Qualified}</p>
            </div>
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Lost</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{stats.Lost}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <Filters
          search={search}
          status={status}
          source={source}
          sort={sort}
          onSearchChange={setSearch}
          onStatusChange={(val) => { setStatus(val); setPage(1) }}
          onSourceChange={(val) => { setSource(val); setPage(1) }}
          onSortChange={(val) => { setSort(val); setPage(1) }}
          onClearFilters={clearFilters}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No leads found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || status || source ? 'Try adjusting your filters' : 'Add your first lead to get started'}
            </p>
          </div>
        ) : (
          /* Leads Table */
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{lead.email}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{lead.source}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditClick(lead)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing {leads.length} of {pagination?.total} leads
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Add / Edit Lead Modal */}
      {showForm && (
        <LeadForm lead={editingLead} onClose={handleFormClose} />
      )}
    </div>
  )
}

export default Dashboard
