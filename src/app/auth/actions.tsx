'use server'
import db from '@/lib/db'
import { users } from '@/lib/db/schema'
import ip from '@/lib/ip'
import { getSession } from '@/lib/session'
import { firstOrNull, NEXT_REDIRECT_ERROR_MESSAGE } from '@/lib/utils'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ulid } from 'ulid'
import * as v from 'valibot'

function validatePhoneNumber(num: unknown): [boolean, string] {
	const schema = v.pipe(
		v.string('Please enter a phone number'),
		v.transform(x => x.replaceAll(' ', '')), // remove all spaces in the string
		v.nonEmpty('Please enter a phone number'),
		v.maxLength(24, 'Number cannot exceed 24 chars'),
		v.minLength(5, 'Number must be atleast 5 characters long.'),
		v.regex(
			/^\+[1-9]\d{1,14}$/,
			'Phone number can only contain digits, and must start with the country code (with a +)'
		) // from https://www.twilio.com/docs/glossary/what-e164
	)

	const op = v.safeParse(schema, num, { abortPipeEarly: true })

	if (!op.success) {
		return [false, op.issues[0]?.message || 'Unknown error']
	} else {
		return [true, op.output]
	}
}

type Err = { success: false; error: string; error_description: string }

type Ret =
	| Err
	| {
			success: true
			phone: string
			sid: string
			channel: 'sms' | 'call'
	  }

async function createVerifyRequest(phone: string, channel: 'sms' | 'call'): Promise<Ret> {
	// if phone number is a test phone number, bypass twilio
	if (process.env.NODE_ENV !== 'production' && phone === process.env.TEST_PHONE_NUMBER) {
		console.debug('Using test phone number')
		return {
			success: true,
			channel,
			phone,
			sid: 'VEaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // fake sid used in demos
		}
	}

	try {
		const res = await fetch(
			`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/Verifications`,
			{
				method: 'POST',
				body: new URLSearchParams({
					To: phone,
					Channel: channel
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization:
						'Basic ' + btoa(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`)
				}
			}
		)
		const data = await res.json()
		if (!res.ok) {
			console.log({ data, phone })
			const message = `(${res.status}) ${data.code || 0}: ${data.message || 'An unknown error occured.'}`
			return {
				success: false,
				error: 'Could not create Verify request',
				error_description: message
			}
		}

		return {
			success: true,
			phone: data.to,
			sid: data.sid,
			channel: data.channel
		}
	} catch (e) {
		console.error(e)
		return {
			success: false,
			error: 'Network error',
			error_description: (e as Error).message
		}
	}
}

export async function sendSMS(_: unknown, fd: FormData): Promise<Ret> {
	const [valid, phone] = validatePhoneNumber(fd.get('tel'))
	if (!valid) {
		return {
			success: false,
			error: 'Invalid phone number',
			error_description: phone
		}
	}

	return await createVerifyRequest(phone, 'sms')
}

export async function sendCall(_: unknown, fd: FormData): Promise<Ret> {
	const [valid, phone] = validatePhoneNumber(fd.get('tel'))
	if (!valid) {
		return {
			success: false,
			error: 'Invalid phone number',
			error_description: phone
		}
	}
	return await createVerifyRequest(phone, 'call')
}

export async function checkCode(_: unknown, fd: FormData): Promise<Err | { success: true }> {
	const schema = v.object({
		code: v.pipe(
			v.string('Please enter your code'),
			v.nonEmpty('Please enter your code'),
			v.length(6, 'The code is 6 digits long'),
			v.regex(/^\d{6}$/, 'The code is 6 digits long, and only contains numbers')
		),
		sid: v.pipe(
			v.string('Invalid request ID'),
			v.nonEmpty('Invalid request ID'),
			v.regex(/^VE[0-9a-fA-F]{32}$/, 'Invalid request ID')
		)
	})
	const op = v.safeParse(schema, { code: fd.get('code'), sid: fd.get('sid') })
	if (!op.success) {
		return {
			success: false,
			error: 'Invalid code',
			error_description: op.issues[0]?.message || 'Unknown error'
		}
	}

	let next = typeof fd.get('next') === 'string' ? (fd.get('next') as string) || '/' : '/'
	if (!next.startsWith('/') || next.startsWith('//')) next = '/'

	// if sid and otp are testing versions, bypass twilio
	if (
		process.env.NODE_ENV !== 'production' &&
		op.output.sid === 'VEaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
	) {
		if (op.output.code !== process.env.TEST_OTP)
			return {
				success: false,
				error: 'Invalid code',
				error_description: 'You have entered the wrong code.'
			}
		try {
			const user = await db.query.users.findFirst({
				where: eq(users.phone, '+123456')
			})
			if (!user) throw new Error('test user is not present in db')
			const ssn = await getSession()
			ssn.loginAt = Date.now().toString()
			ssn.userId = user.id
			await ssn.save()
			revalidatePath('/', 'page')
			redirect(next)
		} catch (e) {
			if ((e as Error).message === NEXT_REDIRECT_ERROR_MESSAGE) throw e
			console.error(e)
			return {
				success: false,
				error: 'Invalid',
				error_description: (e as Error).message
			}
		}
	}

	try {
		const res = await fetch(
			`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/VerificationCheck`,
			{
				method: 'POST',
				body: new URLSearchParams({
					VerificationSid: op.output.sid,
					Code: op.output.code
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization:
						'Basic ' + btoa(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`)
				}
			}
		)
		const data = await res.json()
		if (!res.ok) {
			if (res.status === 404)
				return {
					success: false,
					error: 'Invalid code',
					error_description:
						'The code may have expired, does not exist, or you may have reached the maximum allowed number of attempts. Please request a new code by clicking the change number button.'
				}
			console.log({ data, ...op.output })
			const message = `(${res.status}) ${data.code || 0}: ${data.message || 'An unknown error occured.'}`
			return {
				success: false,
				error: 'Could not check Verification Status',
				error_description: message
			}
		}

		console.log(data)
		if (data.status !== 'approved')
			return {
				success: false,
				error: 'Invalid code',
				error_description: 'You have entered the wrong code.'
			}

		// Validation success, sign the user in
		try {
			let user = (await db.query.users.findFirst({ where: eq(users.phone, data.To) })) ?? null
			if (!user) {
				// user does not exist, create them
				user = firstOrNull(
					await db
						.insert(users)
						.values({
							id: ulid(),
							phone: data.To,
							lastLoginIp: ip()
						})
						.returning()
				)
				if (!user) throw new Error('Could not create user')
			}

			const ssn = await getSession()
			ssn.userId = user.id
			ssn.loginAt = Date.now().toString()
			await ssn.save()

			revalidatePath('/', 'page')
			redirect(next)
		} catch (e) {
			console.error(e)
			return {
				success: false,
				error: 'Could not sign you in (DB_ERROR)',
				error_description: (e as Error).message
			}
		}
	} catch (e) {
		if ((e as Error).message === NEXT_REDIRECT_ERROR_MESSAGE) throw e
		console.error(e)
		return {
			success: false,
			error: 'Network error',
			error_description: (e as Error).message
		}
	}
}
