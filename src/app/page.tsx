"use client"

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CogIcon, Loader2Icon, PlusCircleIcon } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cache, useEffect, useState } from 'react'
import type { meetings } from '@/lib/db/schema'
import { fetchEvents } from './actions'
import { useToast } from '@/components/ui/use-toast'
import { ScheduledFor } from '@/components/scheduled-for'
import {format} from "date-fns"

const cachedFetchEvents = cache(fetchEvents)

function EventCard({event: meeting}: {event: typeof meetings.$inferSelect}) {
	return <Link href={`/meeting/${meeting.id}`} className="border rounded-lg block hover:brightness-110 mb-4 px-4 py-2">
		<h3 className="text-lg mb-2">{meeting.title}</h3>
		<p className="text-muted-foreground text-sm"><ScheduledFor duration={meeting.duration} /></p>
	</Link>
}

export default function Home() {
	const [date, setDate] = useState<Date|undefined>(new Date())
	const [dayEvents, setDayEvents] = useState<typeof meetings.$inferSelect[] | null>(null)
	const [dayEventsLoading, setDayEventsLoading] = useState(true)
	const [otherEvents, setOtherEvents] = useState<typeof meetings.$inferSelect[] | null>(null)
	const [otherEventsLoading, setOtherEventsLoading] = useState(true) 
	const {toast} = useToast()

	useEffect(() => {
		setOtherEventsLoading(true)
		cachedFetchEvents().then((v) => {
			if (!v.success) {
				toast({
					title: v.error,
					description: v.error_description,
					variant: 'destructive',
					duration: 5000
				})
				setOtherEventsLoading(false)
				return
			}
			setOtherEvents(v.data)
			setOtherEventsLoading(false)
		})
	}, [])

	useEffect(() => {
		if (!date) return
		setDayEventsLoading(true)
		cachedFetchEvents(format(date, "yyyy-MM-dd")).then((v) => {
			if (!v.success) {
				toast({
					title: v.error,
					description: v.error_description,
					variant: 'destructive',
					duration: 5000
				})
				setDayEventsLoading(false)
				return
			}
			setDayEvents(v.data)
			setDayEventsLoading(false)
		})
	}, [date])
	
	return (
		<div className="grid grid-cols-1 md:fixed md:h-full md:w-full md:grid-cols-2 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr]">
			<div className="flex flex-col items-center justify-center bg-muted py-10 px-4 md:py-0">
				<h1 className="mb-4 text-4xl font-bold md:hidden">Your Calendar</h1>
				<Card>
					<CardHeader>
						<CardTitle>Calendar</CardTitle>
						<CardDescription>Click on a day to view the meetings you have on that day</CardDescription>
					</CardHeader>
					<CardContent>
						<Calendar mode="single" fromDate={new Date()} selected={date} onSelect={setDate} />
					</CardContent>
					<CardFooter>
						<div className="flex w-full items-center justify-center gap-2">
							<p className="text-gray-700 dark:text-gray-200">In a hurry?</p>{' '}
							<Badge variant="secondary">
								<a href={`tel:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`}>
									Call {process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}
								</a>
							</Badge>
						</div>
					</CardFooter>
				</Card>
				<Card className="mt-4">
					<CardHeader>
						<div className="flex items-center justify-center gap-4">
							<ThemeSwitcher />
							<Button
								title="Settings"
								aria-label="Account settings"
								asChild
								variant="outline"
								size="icon"
							>
								<Link href="/settings">
									<CogIcon className="size-5" />
								</Link>
							</Button>
							<Button asChild variant="destructive">
								<Link href="/logout">Logout</Link>
							</Button>
						</div>
					</CardHeader>
				</Card>
			</div>
			<ScrollArea className="px-6 py-4">
				<h1 className="mt-8 flex items-center justify-between text-4xl font-bold md:text-5xl">
					Your Events
					<Button asChild>
						<Link href="/new">
							<PlusCircleIcon className="size-5 md:mr-2" />
							<span className="sr-only md:not-sr-only">New Meeting</span>
						</Link>
					</Button>
				</h1>
				<hr className="my-4 border-t-2 border-muted" />
				<h3 className="mb-4 mt-8 flex items-center gap-4 text-2xl font-medium md:text-4xl">
					Events on this day <Badge>2024-05-03</Badge>
				</h3>
				{dayEvents !== null && (dayEvents.length === 0 ? <p className="text-gray-600 dark:text-gray-300">
					You have no events on this day.{' '}
					<Link href="/new" className="underline">
						Create one?
					</Link>
				</p> : dayEvents.map(e => <EventCard key={e.id} event={e} />))}
				{dayEventsLoading && <p className="p-4"><Loader2Icon className="size-8 animate-spin" /><span className="sr-only">Loading...</span></p>}
				<h3 className="mb-4 mt-8 flex items-center gap-4 text-2xl font-medium md:text-4xl">
					Other upcoming events
				</h3>
				{otherEvents!== null && (otherEvents.length === 0 ? <p className="text-gray-600 dark:text-gray-300">
					You have no upcoming events.{' '}
					<Link href="/new" className="underline">
						Create one?
					</Link>
				</p> : otherEvents.map(e => <EventCard key={e.id} event={e} />))}
				{otherEventsLoading && <p className="p-4"><Loader2Icon className="size-8 animate-spin" /><span className="sr-only">Loading...</span></p>}
			</ScrollArea>
		</div>
	)
}
