import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  json, 
  uniqueIndex 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  password: text('password'),
  image: text('image'),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
  }
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  configurations: many(configurations),
}));

// OAuth accounts linked to users
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    providerProviderAccountIdIdx: uniqueIndex('provider_provider_account_id_idx').on(
      table.provider,
      table.providerAccountId
    ),
  }
});

// Prize configuration type
export type PrizeConfigType = {
  id: string;
  name: string;
  value: number;
  slots: number;
};

// Saved user configurations
export const configurations = pgTable('configurations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  totalSlots: integer('total_slots').notNull(),
  pricePerSpin: integer('price_per_spin').notNull(),
  defaultPrize: integer('default_prize').notNull(),
  prizeConfigs: json('prize_configs').$type<PrizeConfigType[]>().notNull(),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions for authenticated users
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull(),
  expires: timestamp('expires').notNull(),
});

// Verification tokens for email verification
export const verificationTokens = pgTable('verification_tokens', {
  id: serial('id').primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => {
  return {
    identifierTokenIdx: uniqueIndex('identifier_token_idx').on(
      table.identifier,
      table.token
    ),
  }
});

// Types for our schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Configuration = typeof configurations.$inferSelect;
export type NewConfiguration = typeof configurations.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;