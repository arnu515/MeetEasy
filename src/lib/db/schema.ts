import { index, interval, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	phone: text('phone').notNull().unique(),
	email: text('email').unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	lastLoginIp: text('last_login_ip')
})

export const meetings = pgTable(
	'meetings',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		description: text('description'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		scheduledAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		duration: interval('duration', { fields: 'hour to minute', precision: 0 }),
		ownerId: text('owner_id').references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		})
	},
	tbl => {
		return {
			titleIdx: index('meetings_title_idx').on(tbl.title)
		}
	}
)

export const meetingInvites = pgTable(
	'meeting_invites',
	{
		id: text('id').primaryKey(),
		message: text('message'),
		phone: text('phone'),
		email: text('email'),
		meetingId: text('meeting_id').references(() => meetings.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		}),
		invitedBy: text('inviter_id').references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		})
	},
	tbl => ({
		uniquePhoneInviteConstraint: unique().on(tbl.phone, tbl.meetingId),
		uniqueEmailInviteConstraint: unique().on(tbl.email, tbl.meetingId)
	})
)
