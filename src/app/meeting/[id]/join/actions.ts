'use server'

import db from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { getUser } from '@/lib/user'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { jwt } from 'twilio'
import * as v from 'valibot'

type Ret<T = any> =
	| { success: false; error: string; error_description: string }
	| ({ success: true } & T)

export async function getAccessToken(
	meetingId: string,
	name__UNSANITIZED: string
): Promise<Ret<{ token: string }>> {
	const nameSchema = v.pipe(v.string(), v.nonEmpty(), v.minLength(4), v.maxLength(32))
	const op = v.safeParse(nameSchema, name__UNSANITIZED, { abortPipeEarly: true })
	if (!op.success)
		return { success: false, error: 'Invalid name', error_description: op.issues[0].message }
	const user = await getUser()
	if (!user) redirect('/auth?next=/meeting/' + meetingId)

	try {
		const meeting = await db.query.meetings.findFirst({
			where: eq(meetings.id, meetingId),
			with: {
				invites: { columns: { phone: true, email: true } }
			}
		})
		if (!meeting)
			return { success: false, error: 'Invalid meeting ID', error_description: 'Meeting not found' }
		const isInvited =
			user.id === meeting.ownerId ||
			meeting.invites.some(
				i => (!!i.phone && i.phone === user.phone) || (!!i.email && i.email === user.email)
			)
		if (!isInvited)
			return {
				success: false,
				error: 'Could not join meeting',
				error_description: 'You are not invited to this meeting'
			}
		const from = new Date(meeting.scheduledAt)
		const to = new Date(from)
		const [h, m] = meeting.duration.split(':').map(parseInt)
		to.setMinutes(to.getMinutes() + m)
		to.setHours(to.getHours() + h)
		const now = new Date()
		const status = now < from ? 'future' : now > to ? 'past' : 'present'
		if (status !== 'present')
			return {
				success: false,
				error: 'Could not join meeting',
				error_description:
					status === 'past' ? 'The meeting has ended' : "The meeting hasn't started yet"
			}

		const token = new jwt.AccessToken(
			process.env.TWILIO_ACCOUNT_SID!,
			process.env.TWILIO_API_KEY_SID!,
			process.env.TWILIO_API_KEY_SECRET!,
			{
				identity: op.output
			}
		)
		token.addGrant(
			new jwt.AccessToken.VideoGrant({
				room: `meeting-${meeting.id}`
			})
		)

		return { success: true, token: token.toJwt() }
	} catch (e) {
		console.error(e)
		return { success: false, error: 'Database error', error_description: (e as Error).message }
	}
}
