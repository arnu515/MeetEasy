'use server'

import db from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { getUser } from '@/lib/user'
import { firstOrNull, NEXT_REDIRECT_ERROR_MESSAGE } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { ulid } from 'ulid'
import * as v from 'valibot'

export async function create(_: unknown, fd: FormData) {
	const obj: Record<string, any> = {}
	fd.forEach((v, k) => (obj[k] = v))
	new Date('2020-05-32').toString() === 'Invalid Date'

	const schema = v.object({
		title: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.minLength(4), v.maxLength(32)),
		description: v.optional(v.pipe(v.string(), v.trim(), v.empty(), v.maxLength(512))),
		date: v.pipe(
			v.string(),
			v.trim(),
			v.nonEmpty(),
			v.isoDate(),
			v.custom(x => (typeof x === 'string' ? new Date(x).toString() !== 'Invalid Date' : false))
		),
		from: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.isoTime()),
		to: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.isoTime()),
		offset: v.pipe(
			v.string(),
			v.trim(),
			// technically, the offset can go upto 23:59, but the max realworld offset is UTC+14 (and UTC-12).
			v.regex(/^[-+][0-1]\d:\d\d$/)
		)
	})

	const op = v.safeParse(schema, obj)
	if (!op.success) {
		return {
			success: false,
			error: 'Invalid request',
			error_description: op.issues[0]?.message || 'Unknown error'
		}
	}

	const user = await getUser()
	if (!user) redirect('/auth?next=/new')

	console.log(
		`${op.output.date}T${op.output.from}${op.output.offset}`,
		`${op.output.date}T${op.output.to}${op.output.offset}`
	)
	const fromDate = new Date(`${op.output.date}T${op.output.from}${op.output.offset}`)
	const toDate = new Date(`${op.output.date}T${op.output.to}${op.output.offset}`)
	const now = new Date()
	console.log({ fromDate, toDate })
	if (
		fromDate.getDay() !== toDate.getDay() ||
		fromDate.getMonth() !== toDate.getMonth() ||
		fromDate.getFullYear() !== toDate.getFullYear()
	)
		return {
			success: false,
			error: 'Invalid meeting date and time',
			error_description: 'The from date and to date of the meeting must be on the same day.'
		}
	// handling this case (instead of giving an error) allows the user to specify times like 23:30 to 02:00,
	// and it should be assumed that 02:00 is of the next day.
	if (fromDate >= toDate) {
		// add a day to toDate
		toDate.setDate(toDate.getDate() + 1)
	}
	if (fromDate <= now || toDate <= now)
		return {
			success: false,
			error: 'Invalid meeting date and time',
			error_description: 'Please select a from/to time/date in the future'
		}

	try {
		const meeting = firstOrNull(
			await db
				.insert(meetings)
				.values({
					id: ulid(),
					title: op.output.title,
					description: op.output.description ?? null,
					scheduledAt: fromDate,
					duration: `${Math.abs(toDate.getTime() - fromDate.getTime())}ms`,
					ownerId: user.id
				})
				.returning()
		)
		if (!meeting) throw new Error('No record returned (INTERNAL_ERROR)')
		console.log({ meeting })
		redirect('/meeting/' + meeting.id)
	} catch (e) {
		if ((e as Error).message === NEXT_REDIRECT_ERROR_MESSAGE) throw e
		console.error(e)
		return {
			success: false,
			error: 'Database error',
			error_description: (e as Error).message || 'Unknown error'
		}
	}
}
