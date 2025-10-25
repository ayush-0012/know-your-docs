import { relations } from "drizzle-orm/relations";
import { user, session, chat, query, account, docs } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	chats: many(chat),
}));

export const queryRelations = relations(query, ({one}) => ({
	chat: one(chat, {
		fields: [query.chatId],
		references: [chat.id]
	}),
}));

export const chatRelations = relations(chat, ({one, many}) => ({
	queries: many(query),
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
	docs: many(docs),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const docsRelations = relations(docs, ({one}) => ({
	chat: one(chat, {
		fields: [docs.chatId],
		references: [chat.id]
	}),
}));