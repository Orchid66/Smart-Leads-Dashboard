import { LeadStatus } from '../types'

interface Props {
  status: LeadStatus
}

const statusStyles: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-600',
}

const StatusBadge = ({ status }: Props) => {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
