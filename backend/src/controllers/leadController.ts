import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import Lead from '../models/Lead'

// Helper to build the query filter based on request params
const buildQuery = (req: AuthRequest) => {
  const { status, source, search } = req.query
  const query: Record<string, unknown> = {}

  if (status) query.status = status
  if (source) query.source = source

  // Search by name or email (case-insensitive)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  // Sales users can only see their own leads
  if (req.user?.role === 'sales') {
    query.createdBy = req.user._id
  }

  return query
}

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { sort = 'latest', page = '1', limit = '10' } = req.query

    const query = buildQuery(req)
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum
    const sortOrder = sort === 'oldest' ? 1 : -1

    const total = await Lead.countDocuments(query)
    const leads = await Lead.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')

    res.json({
      leads,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    })
  } catch (err) {
    console.error('Get leads error:', err)
    res.status(500).json({ message: 'Error fetching leads' })
  }
}

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const baseQuery: Record<string, unknown> = {}

    if (req.user?.role === 'sales') {
      baseQuery.createdBy = req.user._id
    }

    // Get count grouped by status
    const statusCounts = await Lead.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const stats: Record<string, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Lost: 0,
    }

    statusCounts.forEach((item) => {
      stats[item._id] = item.count
    })

    const total = Object.values(stats).reduce((a, b) => a + b, 0)

    res.json({ total, ...stats })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' })
  }
}

export const getLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email')

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    // Sales users can only view their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You are not authorized to view this lead' })
    }

    res.json({ lead })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lead' })
  }
}

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, status, source, notes } = req.body

    if (!name || !email || !source) {
      return res.status(400).json({ message: 'Name, email, and source are required' })
    }

    const lead = await Lead.create({
      name,
      email,
      status: status || 'New',
      source,
      notes: notes || '',
      createdBy: req.user?._id,
    })

    res.status(201).json({ lead, message: 'Lead created successfully' })
  } catch (err) {
    console.error('Create lead error:', err)
    res.status(500).json({ message: 'Error creating lead' })
  }
}

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    // Sales users can only update their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You are not authorized to update this lead' })
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.json({ lead: updatedLead, message: 'Lead updated successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error updating lead' })
  }
}

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    // Only admins can delete leads
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete leads' })
    }

    const lead = await Lead.findById(req.params.id)
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    await lead.deleteOne()
    res.json({ message: 'Lead deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting lead' })
  }
}

export const exportCSV = async (req: AuthRequest, res: Response) => {
  try {
    const query: Record<string, unknown> = {}

    if (req.user?.role === 'sales') {
      query.createdBy = req.user._id
    }

    const leads = await Lead.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })

    const header = 'Name,Email,Status,Source,Notes,Created At\n'
    const rows = leads
      .map((lead) => {
        const date = new Date(lead.createdAt).toLocaleDateString('en-IN')
        // Wrap fields in quotes to handle commas in text
        const notes = `"${(lead.notes || '').replace(/"/g, '""')}"`
        return `${lead.name},${lead.email},${lead.status},${lead.source},${notes},${date}`
      })
      .join('\n')

    const csv = header + rows

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"')
    res.send(csv)
  } catch (err) {
    res.status(500).json({ message: 'Error exporting CSV' })
  }
}
