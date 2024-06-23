'use server'

import db from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { and, between, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function fetchEvents(
	isoDateString?: string
): Promise<
	| { success: false; error: string; error_description: string }
	| { success: true; data: (typeof meetings.$inferSelect)[] }
> {
	// no need to check if session is legit or not
	const ssn = await getSession()
	if (!ssn.userId) redirect('/auth')

	const filters = [eq(meetings.ownerId, ssn.userId)]
	if (isoDateString) {
		const from = new Date(isoDateString)
		const to = new Date(isoDateString)
		to.setDate(to.getDate() + 1)
		console.log(from, to)
		filters.push(between(meetings.scheduledAt, from, to))
	}

	try {
		return {
			success: true,
			data: await db.query.meetings.findMany({
				where: and(...filters),
				limit: 100,
				orderBy: meetings.scheduledAt
			})
		}
	} catch (e) {
		console.error(e)
		return { success: false, error: 'Database error', error_description: (e as Error).message }
	}
}
