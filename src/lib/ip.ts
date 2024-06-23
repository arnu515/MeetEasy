import { headers } from 'next/headers'

function ip(): string | null {
	const forwardedFor = headers().get('x-forwarded-for')

	if (forwardedFor) {
		return forwardedFor.split(',')[0] ?? null
	}

	return headers().get('x-real-ip') ?? null
}

export default ip
