import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
	userId?: string | null
	loginAt?: string | null
}

export function getSession() {
	return getIronSession<SessionData>(cookies(), {
		cookieName: 'session',
		password: process.env.SESSION_PASSWORD!,
		cookieOptions: {
			path: '/',
			httpOnly: true
		}
	})
}
