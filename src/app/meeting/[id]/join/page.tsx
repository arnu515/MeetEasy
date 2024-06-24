import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { getUser } from '@/lib/user'
import { eq } from 'drizzle-orm'
import { HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { RoomProvider } from './RoomContext'
import Room from './Room'

async function getMeeting(id: string) {
	const meeting = await db.query.meetings.findFirst({
		where: eq(meetings.id, id),
		with: {
			owner: { columns: { id: true } },
			invites: true
		}
	})

	if (!meeting) notFound()

	return meeting
}

function MeetingStartedGuard({
	from,
	duration,
	children
}: PropsWithChildren<{ from: Date; duration: string }>) {
	const to = new Date(from)
	const [h, m] = duration.split(':').map(parseInt)
	to.setMinutes(to.getMinutes() + m)
	to.setHours(to.getHours() + h)
	const now = new Date()
	const status = now < from ? 'future' : now > to ? 'past' : 'present'

	if (status !== 'present')
		return (
			<div className="mt-20 px-4">
				<Card className="mx-auto max-w-screen-md">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							{status === 'future' ? "The meeting hasn't started yet" : 'The meeting is over'}
							<Button variant="ghost" size="icon" asChild>
								<Link href="/">
									<HomeIcon size={20} />
								</Link>
							</Button>
						</CardTitle>
						<CardContent>
							<p className="mt-4 text-card-foreground">
								{status === 'future' ? (
									<>
										Please wait, the meeting starts at{' '}
										<span className="font-mono">{from.toString()}</span>.
									</>
								) : (
									<>
										The meeting ended on <span className="font-mono">{from.toString()}</span>.
									</>
								)}
							</p>
						</CardContent>
					</CardHeader>
				</Card>
			</div>
		)

	return children
}

export default async function Join({ params: { id } }: { params: { id: string } }) {
	const user = await getUser()
	if (!user) redirect('/auth?next=/meeting/' + id)

	const meeting = await getMeeting(id)
	const isInvited =
		user.id === meeting.ownerId ||
		meeting.invites.some(
			i => (!!i.phone && i.phone === user.phone) || (!!i.email && i.email === user.email)
		)

	if (!isInvited) redirect('/meeting/' + id)

	return (
		<MeetingStartedGuard duration={meeting.duration} from={meeting.scheduledAt}>
			<RoomProvider meeting={meeting}>
				<Room />
			</RoomProvider>
		</MeetingStartedGuard>
	)
}
