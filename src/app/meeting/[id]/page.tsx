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
import { ScheduledFor } from '@/components/scheduled-for'

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

function SignIn({ id }: { id: string }) {
	return (
		<div className="mt-6 flex flex-col gap-4">
			<p className="text-xl">Sign in to see if you're invited to this meeting</p>
			<Button asChild>
				<Link href={`/auth?next=/meeting/${id}`}>Sign in</Link>
			</Button>
		</div>
	)
}

function NotInvited() {
	return (
		<div className="mt-6 flex flex-col gap-4">
			<p className="text-xl">You are unfortunately not invited to this meeting.</p>
			<Button asChild>
				<Link href="/">Home</Link>
			</Button>
			<Button variant="link" asChild>
				<Link href="/new">Create your own meeting</Link>
			</Button>
		</div>
	)
}

function JoinButton({ meetingId }: { meetingId: string }) {
	return (
		<div className="mt-6 flex flex-col gap-4">
			<p className="text-xl">You are invited to this meeting.</p>
			<Button asChild>
				<Link href={`/meeting/${meetingId}/join`}>Join meeting</Link>
			</Button>
			<Button variant="link" asChild>
				<Link href="/">Home</Link>
			</Button>
		</div>
	)
}

export default async function MeetingID({ params: { id } }: { params: { id: string } }) {
	const meeting = await getMeeting(id)
	const user = await getUser()
	const isInvited = user
		? user.id === meeting.ownerId ||
			meeting.invites.some(
				i => (!!i.phone && i.phone === user.phone) || (!!i.email && i.email === user.email)
			)
		: false

	return (
		<div className="mt-20 px-4">
			<Card className="mx-auto max-w-screen-md">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						Join meeting: {meeting.title}{' '}
						{user && (
							<Button variant="ghost" size="icon" asChild>
								<Link href="/">
									<HomeIcon size={20} />
								</Link>
							</Button>
						)}
					</CardTitle>
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
					{user ? (
						isInvited ? (
							<JoinButton meetingId={meeting.id} />
						) : (
							<NotInvited />
						)
					) : (
						<SignIn id={id} />
					)}
				</CardContent>
			</Card>
		</div>
	)
}
