import { relations } from 'drizzle-orm'
import { index, interval, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	phone: text('phone').notNull().unique(),
	email: text('email').unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	lastLoginIp: text('last_login_ip')
})
export const usersRelations = relations(users, ({ many }) => ({
	meetings: many(meetings),
	meetingInvites: many(meetingInvites)
}))

export const meetings = pgTable(
	'meetings',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		description: text('description'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
		duration: interval('duration', { fields: 'hour to minute', precision: 0 }).notNull(),
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
export const meetingsRelations = relations(meetings, ({ one, many }) => ({
	owner: one(users, {
		fields: [meetings.ownerId],
		references: [users.id]
	}),
	invites: many(meetingInvites)
}))

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
export const meetingInvitesRelations = relations(meetingInvites, ({ one }) => ({
	meeting: one(meetings, {
		fields: [meetingInvites.meetingId],
		references: [meetings.id]
	}),
	inviter: one(users, {
		fields: [meetingInvites.invitedBy],
		references: [users.id]
	})
}))
