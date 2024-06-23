import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Form from './Form'
import { Badge } from '@/components/ui/badge'

export default function NewPage() {
	return (
		<div className="px-4 py-4 md:py-20">
			<Card className="mx-auto max-w-[500px]">
				<CardHeader>
					<CardTitle>New Meeting</CardTitle>
					<CardDescription>Create a new meeting</CardDescription>
				</CardHeader>
				<Form />
			</Card>
			<Card className="mx-auto mt-6 max-w-[500px]">
				<CardHeader>
					<CardTitle>Make a Phone Call</CardTitle>
				</CardHeader>
				<CardContent>
					<div>
						Alternatively, you can also call{' '}
						<Badge variant="secondary">
							<a href={`tel:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`}>
								{process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}
							</a>
						</Badge>{' '}
						to create a meeting using your phone.
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
