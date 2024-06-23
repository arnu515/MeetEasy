import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Invite from './Invite'
import { getUser } from '@/lib/user'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

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

function SignIn({id}: {id: string}) {
	return <div className="flex flex-col gap-4 mt-6">
		<p className="text-xl">Sign in to see if you're invited to this meeting</p>
		<Button asChild><Link href={`/auth?next=/meeting/${id}`}>Sign in</Link></Button>
	</div>
}

function NotInvited() {
	// <div className="flex items-center gap-2"></div>
	return <div className="flex flex-col gap-4 mt-6">
		<p className="text-xl">You are unfortunately not invited to this meeting.</p>
		<Button asChild><Link href="/">Home</Link></Button>
		<Button variant="link" asChild><Link href="/new">Create your own meeting</Link></Button>
	</div>
}

export default async function MeetingID({ params: { id } }: { params: { id: string } }) {
	const meeting = await getMeeting(id)
	const user = await getUser()
	const isInvited = user ? user.id === meeting.ownerId || meeting.invites.some(i => (!!i.phone && i.phone === user.phone) || (!!i.email && i.email === user.email)) : false

	return (
		<div className="mt-20 px-4">
			<Card className="mx-auto max-w-screen-md">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">Join meeting: {meeting.title} {user && <Button variant="ghost" size="icon" asChild><Link href="/"><HomeIcon size={20} /></Link></Button>}</CardTitle>
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
					{user ? isInvited ? <p>Invited</p> : <NotInvited /> : <SignIn id={id} />}
				</CardContent>
			</Card>
		</div>
	)
}
