import {pgTable, text, timestamp} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text('id').primaryKey(),
  phone: text('phone').notNull().unique(),
  email: text('email').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginIp: text('last_login_ip')
})

