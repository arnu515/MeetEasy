export function ScheduledFor({ duration }: { duration: string }) {
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
			{minute !== '00' && minuteSpan}.
		</>
	)
}
