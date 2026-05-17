import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { Lead } from '../types'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import LeadForm from '../components/LeadForm'

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [id])

  const fetchLead = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/leads/${id}`)
      setLead(res.data.lead)
    } catch {
      setError('Could not load lead details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    try {
      await api.delete(`/leads/${id}`)
      navigate('/')
    } catch {
      alert('Failed to delete lead')
    }
  }

  const handleEditClose = () => {
    setShowEdit(false)
    fetchLead() // Refresh lead data after edit
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 text-lg">{error || 'Lead not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{lead.email}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Source</p>
                <p className="text-gray-800">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Status</p>
                <p className="text-gray-800">{lead.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Created By</p>
                <p className="text-gray-800">{lead.createdBy?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Created At</p>
                <p className="text-gray-800">
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {lead.notes && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Notes</p>
                <p className="text-gray-700 text-sm bg-gray-50 rounded-lg px-4 py-3 border">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Edit Lead
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                Delete Lead
              </button>
            )}
          </div>
        </div>
      </div>

      {showEdit && <LeadForm lead={lead} onClose={handleEditClose} />}
    </div>
  )
}

export default LeadDetail
