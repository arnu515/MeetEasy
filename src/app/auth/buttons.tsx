'use client'

import { Button } from '@/components/ui/button'
import { MailIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

function getUrl(toIncludeEmail: boolean) {
	const url = new URL(window.location.href)

	if (toIncludeEmail) url.searchParams.set('email', '1')
	else url.searchParams.delete('email')

	return url.toString()
}

export function UsePhoneNumberButton() {
	const router = useRouter()

	return (
		<Button variant="link" onClick={() => router.replace(getUrl(false))}>
			Use My Phone Number
		</Button>
	)
}

export function EmailButton() {
	const router = useRouter()

	return (
		<Button
			variant="outline"
			className="rounded-full"
			title="Use my Email"
			aria-label="Use my Email"
			onClick={() => router.replace(getUrl(true))}
		>
			<MailIcon size={16} />
		</Button>
	)
}
