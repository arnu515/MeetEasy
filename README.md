# MeetEasy

This project was supposed to be submitted to the [Twilio Challenge on DEV](https://dev.to/challenges/twilio), but I unfortunately ran out of time and couldn't complete it before the deadline.

## Deployment Plan

- Host postgres and redis on a droplet, deploy frontend to vercel.
- Twilio voice IVR would've been hosted on Twilio functions.

## Features

These are the planned features. The ones with the checkbox were completed

- [X] Login with phone number
- [ ] Login with email
- [ ] Call and place meeting
- [X] Schedule meetings
- [X] Join meetings
- [ ] Publish local audio and video
- [ ] Meeting chat with AI
  - [ ] Image generation
  - [ ] Chat with AI
  - [ ] AI Summaries
- [X] Invite to meetings
  - [ ] Send invite via phone and email
- [X] Dark and light themes
- [ ] Cache with Redis

I could've probably finished this project if I had more time (I was only able to put in 4-5 days of work).

## Tech Stack

If only I didn't have analysis paralysis! I went from SvelteKit, to Go + Templ, back to SvelteKit, and finally back to Next.js

I don't prefer react to svelte, I just taught I'd be able to finish the project faster with Next.js, which clearly wasn't the case.

- Next.js
- TailwindCSS
- shadcn/ui
- DrizzleORM
- vvo/iron-session
- Twilio services used (and planned to use):
  - [X] Verify
  - [X] Video (I learnt it was deprecated the hard way)
  - [ ] Voice
  - [ ] SMS
  - [ ] Sendgrid
  - [ ] Serverless

## Local Development

- Clone the repo.
- Install dependencies with Bun (or whatever you prefer).
- Copy paste `.env.example` to `.env` and fill out the variables with your own.
- `bun dev`
