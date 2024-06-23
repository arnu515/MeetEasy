import type { IronSession } from 'iron-session'
import { getSession, type SessionData } from './session'
import db from './db'
import { eq } from 'drizzle-orm'
import { users } from './db/schema'
import { firstOrNull } from './utils'

export async function getUser(session?: IronSession<SessionData>) {
	const ssn = session || (await getSession())
	if (!ssn.userId) return null
	try {
		return firstOrNull(await db.select().from(users).where(eq(users.id, ssn.userId!)))
	} catch (e) {
		console.error('Could not get user: ', e)
		return null
	}
}
