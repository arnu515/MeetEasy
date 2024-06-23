import type { Metadata } from 'next'
import { Overpass as FontSans, Red_Hat_Mono as FontMono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'

const fontSans = FontSans({
	variable: '--font-sans',
	weight: 'variable',
	subsets: ['latin', 'latin-ext']
})

const fontMono = FontMono({
	variable: '--font-mono',
	weight: 'variable',
	subsets: ['latin', 'latin-ext']
})

export const metadata: Metadata = {
	title: 'MeetEasy : Meetings made Easy!',
	description: 'Use MeetEasy to schedule meetings with ease!'
}

function changeTheme() {
	const toDark = window.matchMedia('(prefers-color-scheme: dark)').matches
	let theme = localStorage.getItem('theme')
	if (!theme) {
		theme = toDark ? 'dark' : 'light'
	}
	if (theme === 'dark') document.documentElement.classList.add('dark')
	else document.documentElement.classList.remove('dark')
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: `(${changeTheme.toString()})()` }} />
			</head>
			<body className={cn('font-sans antialiased', fontSans.variable, fontMono.variable)}>
				{children}
				<Toaster />
			</body>
		</html>
	)
}
