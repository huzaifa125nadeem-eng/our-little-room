import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', { id:text('id').primaryKey(), state:text('state').notNull(), revision:integer('revision').notNull().default(0) });
export const chats = sqliteTable('chats', {id:text('id').primaryKey(), messages:text('messages').notNull().default('[]'), busyUntil:integer('busy_until').notNull().default(0), requestId:text('request_id').notNull().default('')});
export const chatBudget = sqliteTable('chat_budget', {id:text('id').primaryKey(), day:text('day').notNull(), count:integer('count').notNull().default(0)});
