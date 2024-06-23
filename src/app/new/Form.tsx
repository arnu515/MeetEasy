'use client'
import { useFormState } from 'react-dom'
import { create } from './actions'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarIcon, ChevronsLeftIcon, Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFormStatus } from 'react-dom'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { PopoverTrigger } from '@radix-ui/react-popover'
import { useEffect, useMemo, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { cn, getTimeZoneOffset } from '@/lib/utils'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

function BackButton() {
	const router = useRouter()

	return (
		<Button type="button" onClick={() => router.back()} variant="link">
			<ChevronsLeftIcon className="mr-2 size-5" />
			Back
		</Button>
	)
}

function SubmitButton() {
	const { pending } = useFormStatus()

	return (
		<Button type="submit" disabled={pending}>
			{pending && <Loader2Icon className="mr-2 size-5 animate-spin" />} Create
		</Button>
	)
}

function DatePicker() {
	const [date, setDate] = useState<Date | null>(null)

	return (
		<>
			<input
				type="hidden"
				defaultValue={date ? format(date, 'yyyy-MM-dd') : undefined}
				name="date"
			/>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" className={cn(!date && 'text-muted-foreground')}>
						<CalendarIcon className="mr-2 size-5" />
						{!!date ? format(date, 'PPPP') : 'Pick a date'}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto rounded-md bg-background px-4 py-2">
					<Label>Select date</Label>
					<Calendar
						mode="single"
						fromDate={new Date()}
						selected={date ?? undefined}
						onSelect={x => setDate(x ?? null)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</>
	)
}

export default function Form() {
	const [state, action] = useFormState(create, null)
	const [error, setError] = useState<{ n: string; d: string } | undefined>()
	const offset = useMemo(() => getTimeZoneOffset(), [])
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
	}, [state, toast])

	return (
		<form action={action}>
			<CardContent>
				<div className="my-2">
					<Label htmlFor="title">
						Meeting Title{' '}
						<span className="text-red-500">
							* <span className="sr-only">required</span>
						</span>
					</Label>
					<Input
						type="text"
						name="title"
						id="title"
						maxLength={32}
						minLength={4}
						required
						placeholder="Enter a short title"
					/>
				</div>
				<div className="my-2">
					<Label htmlFor="description">Meeting Description</Label>
					<Textarea
						rows={3}
						name="description"
						id="description"
						maxLength={512}
						placeholder="Enter your meeting's description"
					/>
				</div>
				<div className="my-2">
					<Label>Date of Meeting</Label>
				</div>
				<div className="my-2">
					<DatePicker />
				</div>
				<Label className="mt-2">Time of Meeting</Label>
				<div className="mb-2 flex flex-wrap items-center gap-2">
					<Label id="from-input">From:</Label>
					<Input type="time" id="from-input" className="w-auto" name="from" required />
					<Label id="to-input">To:</Label>
					<Input type="time" id="to-input" className="w-auto" name="to" required />
				</div>
				<input type="hidden" name="offset" value={offset.replace('UTC', '')} />
				<p className={cn('mt-4 text-sm', error ? 'text-red-500' : 'text-muted-foreground')}>
					{error ? error.d || error.n : `You can invite people after creating the meeting. Dates are in your timezone. (${offset})`}
				</p>
			</CardContent>
			<CardFooter className="justify-between">
				<BackButton />
				<SubmitButton />
			</CardFooter>
		</form>
	)
}
