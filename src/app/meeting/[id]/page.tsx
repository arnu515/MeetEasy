import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Invite from './Invite'
import { getUser } from '@/lib/user'

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

function ScheduledFor({ duration }: { duration: string }) {
	const [hour, minute] = duration.split(':')
	const hourSpan = (
		<span className="text-mono font-medium text-foreground">
			{hour} hour{hour !== '01' && 's'}
		</span>
	)
	const minuteSpan = (
		<span className="text-mono font-medium text-foreground">
			{minute} minute{minute !== '01' && 's'}
		</span>
	)

	return (
		<>
			Scheduled for {hour !== '00' && hourSpan}
			{hour !== '00' && minute !== '00' && ' and '}
			{minute !== '0' && minuteSpan}.
		</>
	)
}

export default async function MeetingID({ params: { id } }: { params: { id: string } }) {
	const meeting = await getMeeting(id)
	const user = await getUser()

	return (
		<div className="mt-20 px-4">
			<Card className="mx-auto max-w-screen-md">
				<CardHeader>
					<CardTitle>Join meeting: {meeting.title}</CardTitle>
					<CardDescription>
						Meeting description: {meeting.description || <em>No description provided</em>}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-lg text-muted-foreground">
						On{' '}
						<span className="text-mono font-medium text-foreground">
							{meeting.scheduledAt.toLocaleDateString()}
						</span>
						, at{' '}
						<span className="text-mono font-medium text-foreground">
							{meeting.scheduledAt.toLocaleTimeString()}.
						</span>
						<br />
						<ScheduledFor duration={meeting.duration} />
					</p>
					{user?.id === meeting.ownerId && (
						<Invite invites={meeting.invites} meetingId={meeting.id} />
					)}
				</CardContent>
			</Card>
		</div>
	)
}
