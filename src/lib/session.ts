import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'
import db from './db'
import { eq } from 'drizzle-orm'
import { users } from './db/schema'

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

export async function getUser(session?: IronSession<SessionData>) {
	const ssn = session || await getSession()
	if (!ssn.userId) return null
	try {
		return await db.query.users.findFirst({where: eq(users.id, ssn.userId!)}) ?? null
	} catch(e) {
		console.error("Could not get user: ", e)
		return null
	}
}
