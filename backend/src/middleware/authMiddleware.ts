import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

// Extend Express Request to attach user info
export interface AuthRequest extends Request {
  user?: IUser
}

interface JwtPayload {
  id: string
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, access denied' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Middleware to restrict to admin only
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }
  next()
}
