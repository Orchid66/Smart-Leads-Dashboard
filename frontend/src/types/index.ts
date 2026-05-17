export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'sales'
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost'
export type LeadSource = 'Website' | 'Instagram' | 'Referral'

export interface Lead {
  _id: string
  name: string
  email: string
  status: LeadStatus
  source: LeadSource
  notes: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaginationInfo {
  total: number
  page: number
  pages: number
  limit: number
}

export interface LeadStats {
  total: number
  New: number
  Contacted: number
  Qualified: number
  Lost: number
}

export interface LeadFilters {
  search: string
  status: string
  source: string
  sort: string
  page: number
}
