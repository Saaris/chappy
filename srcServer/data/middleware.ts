import type { Request, Response, NextFunction } from 'express'
import { validate, type Payload } from './auth.js'

declare global {
    namespace Express {
        interface Request {
            user?: Payload
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const payload = validate(authHeader)
    
    if (!payload) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        })
    }
    
    req.user = payload
    next()
}
