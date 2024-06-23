import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const ssn = await getSession()
	ssn.destroy()

	const url = new URL(req.url)
	let next = url.searchParams.get('next') || '/auth'
	const newUrl = new URL(next, url.origin)
	if (newUrl.origin !== url.origin) next = '/auth'
	else next = newUrl.pathname

	return NextResponse.redirect(new URL(next, url.origin), { status: 302 })
}
