'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2Icon } from 'lucide-react'
import {
	cache,
	createContext,
	PropsWithChildren,
	ReactNode,
	Suspense,
	use,
	useEffect,
	useState
} from 'react'
import { getAccessToken } from './actions'
import { useToast } from '@/components/ui/use-toast'
import { connect, Room, TwilioError } from 'twilio-video'
import type { meetings } from '@/lib/db/schema'
import { useRouter } from 'next/navigation'

interface IRoomContext {
	name: string
	token: string
	room: Room
	meeting: typeof meetings.$inferSelect
}
export const RoomContext = createContext<IRoomContext>({
	name: '',
	token: '',
	room: {} as any,
	meeting: {} as any
})

function GetName({ onDone }: { onDone: (name: string) => void }) {
	const [name, setName] = useState('')
	useEffect(() => {
		setName(localStorage.getItem('name') || '')
	}, [])

	return (
		<div className="px-4 py-4 md:py-20">
			<Card className="mx-auto max-w-[500px]">
				<CardHeader>
					<CardTitle>Enter your name</CardTitle>
					<CardDescription>You'll be shown to others in the meeting as this name</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col justify-center gap-2">
						<Input
							aria-label="name"
							placeholder="Your name"
							type="text"
							minLength={4}
							maxLength={32}
							required
							value={name}
							onChange={e => setName(e.target.value)}
						/>
						<Button onClick={() => onDone(name)}>Join meeting</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

const cachedGetAccessToken = cache(getAccessToken)
function GetToken({
	meetingId,
	name,
	onDone,
	onFail
}: {
	meetingId: string
	name: string
	onDone: (token: string) => void
	onFail: () => void
}) {
	const { toast } = useToast()
	const data = use(cachedGetAccessToken(meetingId, name))

	useEffect(() => {
		if (!data.success) {
			toast({
				title: data.error,
				description: data.error_description,
				variant: 'destructive',
				duration: 5000
			})
			onFail()
		}

		if (data.success) {
			onDone(data.token)
		}
	}, [data, toast])

	return null
}

const Loader = () => (
	<div className="flex items-center justify-center p-4 md:py-20">
		{' '}
		<Loader2Icon className="size-8 animate-spin" />{' '}
	</div>
)

function RoomConnectGuard({
	token,
	render,
	onDisconnect
}: {
	token: string
	render: (room: Room) => ReactNode
	onDisconnect: (r: Room, e: TwilioError) => void
}) {
	const [room, setRoom] = useState<Room | null>(null)

	useEffect(() => {
		;(async () => {
			const room = await connect(token, {
				video: false,
				audio: false
			})
			console.log(room)
			setRoom(room)

			room.on('disconnected', onDisconnect)
		})()

		return () => {
			room?.off('disconnect', onDisconnect)
			room?.disconnect()
		}
	}, [])

	if (!room) return <Loader />

	return render(room)
}

export function RoomProvider({
	meeting,
	children
}: PropsWithChildren<{ meeting: typeof meetings.$inferSelect }>) {
	const [name, setName] = useState('')
	const [token, setToken] = useState('')
	const router = useRouter()

	if (!name) {
		return (
			<GetName
				onDone={name => {
					localStorage.setItem('name', name)
					setName(name)
				}}
			/>
		)
	}

	if (!token) {
		return (
			<Suspense fallback={<Loader />}>
				<GetToken meetingId={meeting.id} name={name} onDone={setToken} onFail={() => setName('')} />
			</Suspense>
		)
	}

	return (
		<RoomConnectGuard
			onDisconnect={() => router.replace(`/meeting/${meeting.id}`)}
			token={token}
			render={room => (
				<RoomContext.Provider value={{ name, token, room, meeting }}>
					{children}
				</RoomContext.Provider>
			)}
		/>
	)
}
