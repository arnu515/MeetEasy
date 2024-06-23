'use server'

import db from '@/lib/db'
import { meetingInvites } from '@/lib/db/schema'
import { getUser } from '@/lib/user'
import { emailSchema, phoneNumberSchema } from '@/lib/validation'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ulid } from 'ulid'
import * as v from 'valibot'

type Ret = { success: false; error: string; error_description: string } | { success: true }

export async function deleteInvite(id: string): Promise<Ret> {
	const user = await getUser()
	if (!user) redirect('/auth')

	try {
		await db
			.delete(meetingInvites)
			.where(and(eq(meetingInvites.id, id), eq(meetingInvites.invitedBy, user.id)))
		return { success: true }
	} catch (e) {
		return {
			success: false,
			error: 'Database error',
			error_description: (e as Error).message || 'An unknown error occured'
		}
	}
}

export async function invite(_: unknown, fd: FormData): Promise<Ret> {
	const phNo__UNSANITIZED = fd.get('phone')
	const email__UNSANITIZED = fd.get('email')
	const id = fd.get('id')

	if ((!phNo__UNSANITIZED && !email__UNSANITIZED) || typeof id !== 'string')
		return {
			success: false,
			error: 'Invalid request',
			error_description: 'Please fill out atleast one out of the two fields'
		}

	let phone: string | null = null
	if (phNo__UNSANITIZED) {
		const op = v.safeParse(phoneNumberSchema, phNo__UNSANITIZED, { abortPipeEarly: true })
		if (!op.success)
			return {
				success: false,
				error: 'Invalid request',
				error_description: op.issues[0].message
			}
		phone = op.output
	}

	let email: string | null = null
	if (email__UNSANITIZED) {
		const op = v.safeParse(emailSchema, email__UNSANITIZED, { abortPipeEarly: true })
		if (!op.success)
			return {
				success: false,
				error: 'Invalid request',
				error_description: op.issues[0].message
			}
		email = op.output
	}

	const messageSchema = v.pipe(v.string(), v.trim(), v.empty(), v.maxLength(512))
	const op = v.safeParse(messageSchema, fd.get('message'))
	const message = op.success ? op.output : null

	const user = await getUser()
	if (!user) redirect('/auth?next=/meeting/' + id)

	try {
		await db.insert(meetingInvites).values({
			id: ulid(),
			email,
			phone,
			invitedBy: user.id,
			meetingId: id,
			message: message || null
		})

		revalidatePath('/meeting/' + id)
		return { success: true }
	} catch (e) {
		console.error(e)
		return { success: false, error: 'Database error', error_description: (e as Error).message }
	}
}
