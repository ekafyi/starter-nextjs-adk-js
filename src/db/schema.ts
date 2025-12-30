import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(CURRENT_TIMESTAMP)`,
	),
});

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	events: text("events").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(CURRENT_TIMESTAMP)`,
	),
});
