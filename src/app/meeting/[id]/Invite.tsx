'use client'

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { meetingInvites } from '@/lib/db/schema'
import { Loader2Icon, MailIcon, PhoneCallIcon, TrashIcon } from 'lucide-react'
import { useFormState } from 'react-dom'
import { deleteInvite, invite } from './actions'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

function InviteSomeoneDialog({ meetingId }: { meetingId: string }) {
	const [open, setOpen] = useState(false)
	const [state, action, pending] = useFormState(invite, null)
	const [error, setError] = useState<{ n: string; d: string } | undefined>()
	const { toast } = useToast()

	useEffect(() => {
		if (state?.success === false) {
			setError({ n: state.error, d: state.error_description })
			toast({
				title: state.error || state.error_description || 'Invalid request',
				description: state.error_description,
				variant: 'destructive',
				duration: 5000
			})
			return
		}
		if (state?.success) {
			toast({
				title: 'Invited successfully',
				description:
					'An invite was created successfully. The person invited has received a notification.',
				duration: 5000
			})
			setOpen(false)
		}
	}, [state, toast])

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button className="ml-auto block" variant="outline" size="sm">
					Invite someone
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Invite someone</AlertDialogTitle>
					<AlertDialogDescription>
						Invite someone to this meeting by entering their information.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<form action={action}>
					<p className="mt-2 text-center text-sm text-gray-300 dark:text-gray-700">
						NOTE: SMSes to US phone numbers may not be delivered properly.
					</p>
					<div className="my-4">
						<div className="my-2">
							<Label htmlFor="phone">Their Phone number</Label>
							<Input name="phone" id="phone" type="tel" placeholder="+123 456 7890" />
						</div>
						<div className="my-2">
							<Label htmlFor="email">Their Email</Label>
							<Input name="email" id="email" type="email" placeholder="someperson@example.com" />
						</div>
						<input type="hidden" name="id" value={meetingId} />
						<p className={cn('mt-4 text-sm', error ? 'text-red-500' : 'text-muted-foreground')}>
							{error ? error.d || error.n : 'Please fill out atleast one of these two fields'}
						</p>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button disabled={pending}>
							{pending && <Loader2Icon className="mr-2 size-5 animate-spin" />} Invite{' '}
						</Button>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	)
}

function DeleteInviteButton({ id, meetingId }: { id: string; meetingId: string }) {
	const [pending, setPending] = useState(false)

	return (
		<Button
			disabled={pending}
			variant="destructive"
			aria-label="Delete"
			title="Delete"
			size="icon"
			onClick={() => {
				setPending(true)
				deleteInvite(id, meetingId).then(() => setPending(false))
			}}
		>
			{' '}
			{pending ? <Loader2Icon className="size-5 animate-spin" /> : <TrashIcon size={20} />}
		</Button>
	)
}

export default function Invite({
	invites,
	meetingId
}: {
	invites: (typeof meetingInvites.$inferSelect)[]
	meetingId: string
}) {
	return (
		<div className="mt-6 flex flex-col justify-center gap-2">
			<h3 className="text-xl font-medium">Meeting Invites</h3>
			<p className="text-sm text-muted-foreground">(only you can see this)</p>
			{invites.length > 0 ? (
				invites.map(i => (
					<div
						className="flex items-center justify-between rounded-lg border bg-muted px-4 py-2 text-muted-foreground"
						key={i.id}
					>
						<div className="flex flex-col gap-2">
							{i.phone && (
								<p className="flex items-center gap-2">
									<PhoneCallIcon size={16} /> <span className="font-mono">{i.phone}</span>
								</p>
							)}
							{i.email && (
								<p className="flex items-center gap-2">
									<MailIcon size={16} /> <span className="font-mono">{i.email}</span>
								</p>
							)}
						</div>
						<DeleteInviteButton id={i.id} meetingId={meetingId} />
					</div>
				))
			) : (
				<p className="my-2 text-center text-muted-foreground">You have not invited anyone.</p>
			)}
			{invites.length < 3 && <InviteSomeoneDialog meetingId={meetingId} />}
		</div>
	)
}
