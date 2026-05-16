import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AuthRequest } from '../middleware/authMiddleware'

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  })
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'sales',
    })

    const token = generateToken(user._id.toString())

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id.toString())

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login' })
  }
}

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      user: {
        id: req.user?._id,
        name: req.user?.name,
        email: req.user?.email,
        role: req.user?.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
