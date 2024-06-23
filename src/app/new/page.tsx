import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Form from './Form'

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
		</div>
	)
}
