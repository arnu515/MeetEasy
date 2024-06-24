'use client'

import { useContext } from 'react'
import { RoomContext } from './RoomContext'
import { ScheduledFor } from '@/components/scheduled-for'
import { Button } from '@/components/ui/button'
import { PhoneOffIcon, MicIcon } from 'lucide-react'

export default function Room() {
	const ctx = useContext(RoomContext)

	return (
		<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1.5fr_1fr] lg:grid-cols-[2fr_1fr]">
			<main className="rounded-lg border px-4 py-2">
				<h1 className="my-4 text-2xl font-semibold">In a Meeting: {ctx.meeting.title}</h1>
				{ctx.meeting.description && (
					<p className="my-2 text-muted-foreground">
						<span className="font-medium">Meeting description:</span> {ctx.meeting.description}
					</p>
				)}
				<p className="my-2 text-lg text-muted-foreground">
					<ScheduledFor duration={ctx.meeting.duration} />
				</p>
			</main>
			<aside className="rounded-lg border px-4 py-2">
				<h3 className="my-4 text-lg font-semibold">
					Joined as:{' '}
					<span className="font-monospace text-muted-foreground">
						{ctx.room.localParticipant.identity}
					</span>
				</h3>
				<div className="flex flex-col items-center justify-center gap-4">
					<Button className="flex w-full items-center gap-2">
						<MicIcon size={20} />
						Unmute microphone
					</Button>
					<Button
						variant="destructive"
						className="flex w-full items-center gap-2"
						onClick={() => {
							if (window.confirm('Are you sure you want to leave this meeting?'))
								ctx.room.disconnect()
						}}
					>
						<PhoneOffIcon size={20} />
						Leave meeting
					</Button>
				</div>
			</aside>
		</div>
	)
}
