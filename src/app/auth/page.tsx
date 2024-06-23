'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmailButton, UsePhoneNumberButton } from './buttons'
import { Loader2, PhoneCallIcon } from 'lucide-react'
import { sendSMS, sendCall, checkCode } from './actions'
import { useFormState, useFormStatus } from 'react-dom'
import { useToast } from '@/components/ui/use-toast'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useSearchParams } from 'next/navigation'

function SubmitButton({ text }: { text: string }) {
	const { pending } = useFormStatus()
	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending && <Loader2 size={20} className="mr-2 animate-spin" />}
			{text}
		</Button>
	)
}

function CallButton({ callAction }: { callAction: (fd: FormData) => void }) {
	const { pending } = useFormStatus()
	return (
		<Button
			formAction={callAction}
			disabled={pending}
			variant="outline"
			className="rounded-full"
			title="Call me instead"
			aria-label="Call me instead"
		>
			{pending ? <Loader2 size={20} className="animate-spin" /> : <PhoneCallIcon size={16} />}
		</Button>
	)
}

function OTPForm({
	phone,
	sid,
	channel,
	onBack,
	next
}: {
	phone: string
	sid: string
	channel: 'sms' | 'call'
	onBack: () => void
	next: string
}) {
	const [state, action] = useFormState(checkCode, null)
	const { toast } = useToast()

	useEffect(() => {
		if (!state) return
		const error = !state.success ? state : null
		console.log(error)
		if (error) {
			toast({
				title: error.error,
				description: error.error_description,
				variant: 'destructive',
				duration: 5000
			})
			return
		}
	}, [state, toast])

	return (
		<form action={action} className="flex flex-col items-center justify-center px-6">
			<div className="flex min-w-[300px] flex-col gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold">Enter the code</h1>
					<p className="text-balance text-muted-foreground">
						A code was sent to your phone. Please enter it below.
					</p>
				</div>
				<div className="grid gap-4">
					<div className="flex flex-col items-center justify-center gap-2">
						<Label htmlFor="code">Sign-in Code</Label>
						<InputOTP
							maxLength={6}
							className="px-auto"
							id="code"
							name="code"
							required
							pattern={REGEXP_ONLY_DIGITS}
						>
							<InputOTPGroup>
								<InputOTPSlot className="size-12 text-lg" index={0} />
								<InputOTPSlot className="size-12 text-lg" index={1} />
								<InputOTPSlot className="size-12 text-lg" index={2} />
								<InputOTPSlot className="size-12 text-lg" index={3} />
								<InputOTPSlot className="size-12 text-lg" index={4} />
								<InputOTPSlot className="size-12 text-lg" index={5} />
							</InputOTPGroup>
						</InputOTP>
						<input type="hidden" name="sid" value={sid} />
						<input type="hidden" name="next" value={next} />
					</div>
					<SubmitButton text="Sign In" />
					<p className="text-center text-sm text-muted">
						Sent via <span className="font-mono uppercase">{channel}</span>
					</p>
				</div>
				<div>
					<div className="flex items-center justify-center gap-4">
						<Button variant="link" type="button" onClick={onBack}>
							Not {'+' + phone.substring(phone.length - 3).padStart(phone.length - 1, '*')}? Click
							to change number
						</Button>
					</div>
				</div>
			</div>
			<p className="absolute bottom-10 max-w-[80%] px-4 text-center text-sm text-red-500 opacity-80">
				{state?.success === false ? state.error_description || state.error : null}
			</p>
		</form>
	)
}

interface Data {
	phone: string
	sid: string
	channel: 'sms' | 'call'
}

function PhoneNumberOrEmailForm({
	isEmail,
	onDone
}: {
	isEmail: boolean
	onDone: (data: Data) => void
}) {
	const [smsState, smsAction] = useFormState(sendSMS, null)
	const [callState, callAction] = useFormState(sendCall, null)
	const { toast } = useToast()

	useEffect(() => {
		if (!smsState && !callState) return
		const error =
			smsState?.success === false ? smsState : callState?.success === false ? callState : null
		console.log(error)
		if (error) {
			toast({
				title: error.error || error.error || 'Invalid Phone Number',
				description: error.error_description,
				variant: 'destructive',
				duration: 5000
			})
			return
		}

		const data: Data | null =
			smsState?.success === true
				? { phone: smsState.phone, sid: smsState.sid, channel: 'sms' }
				: callState?.success === true
					? { phone: callState.phone, sid: callState.sid, channel: 'call' }
					: null
		if (data) {
			toast({
				title: data.channel === 'sms' ? 'An SMS was sent' : 'A call will be placed shortly',
				description:
					data.channel === 'sms'
						? 'An SMS containing the sign-in code was sent to your number.'
						: 'You will be called shortly. The call agent will speak out the code to you.',
				duration: 5000
			})
			onDone(data)
		}
	}, [smsState, callState, toast])

	return (
		<form action={smsAction} className="flex flex-col items-center justify-center px-6">
			<div className="flex min-w-[300px] flex-col gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold">{isEmail ? 'Enter your email' : 'Authenticate'}</h1>
					<p className="text-balance text-muted-foreground">
						{isEmail ? 'Enter your email to sign in.' : 'Enter your phone number to sign in / up.'}
					</p>
				</div>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor={isEmail ? 'email' : 'tel'}>
							{isEmail ? 'Your Email' : 'Your Phone Number'}
						</Label>
						<Input
							id={isEmail ? 'email' : 'tel'}
							name={isEmail ? 'email' : 'tel'}
							type={isEmail ? 'email' : 'tel'}
							placeholder={isEmail ? 'john.doe@example.com' : '+123 456 7890'}
							required
						/>
					</div>
					<SubmitButton text={isEmail ? 'Send a code to my Inbox' : 'Send me an SMS'} />
				</div>
				<div>
					<h3 className="my-4 text-center font-mono uppercase text-slate-400">Or</h3>
					<div className="flex items-center justify-center gap-4">
						{' '}
						{isEmail ? (
							<UsePhoneNumberButton />
						) : (
							<>
								<CallButton callAction={callAction} />
								<EmailButton />
							</>
						)}
					</div>
				</div>
			</div>
			<p className="absolute bottom-10 max-w-[80%] px-4 text-center text-sm text-red-500 opacity-80">
				{smsState?.success === false
					? smsState.error_description || smsState.error
					: callState?.success === false
						? callState.error_description || callState.error
						: null}
			</p>
		</form>
	)
}

export default function AuthPage() {
	const sp = useSearchParams()
	const isEmail = sp.has('email')
	const [data, setData] = useState<Data | undefined>()
	const [next, setNext] = useState(sp.get('next') || '/')

	useEffect(() => {
		let nextToSet = sp.get('next') || '/'
		const url = new URL(window.location.href)
		const newUrl = new URL(nextToSet, url.origin)
		if (newUrl.origin !== url.origin) nextToSet = '/'
		else nextToSet = newUrl.pathname
		setNext(nextToSet)
	}, [sp])

	return (
		<div className="fixed left-0 top-0 grid h-full w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr`]">
			{typeof data === 'undefined' ? (
				<PhoneNumberOrEmailForm
					onDone={x => {
						setData(x)
					}}
					isEmail={isEmail}
				/>
			) : (
				<OTPForm
					next={next}
					onBack={() => {
						setData(undefined)
					}}
					{...data}
				/>
			)}
			<div className="hidden bg-muted md:block"></div>
		</div>
	)
}
