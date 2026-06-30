import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

// ── Existing table — kept as-is ───────────────────────────────────────────────
export const AIOutput = pgTable('aiOutput', {
  id:           serial('id').primaryKey(),
  formData:     varchar('formData'),
  aiResponse:   text('aiResponse'),
  templateSlug: varchar('templateSlug'),
  createdBy:    varchar('createdBy'),
  createdAt:    varchar('createdAt'),
})

// ── New tables ────────────────────────────────────────────────────────────────

// User record — plan/billing fields are nullable placeholders for future Stripe
export const users = pgTable('users', {
  id:            serial('id').primaryKey(),
  clerkUserId:   varchar('clerkUserId',   { length: 128 }).notNull().unique(),
  email:         varchar('email',         { length: 255 }),
  name:          varchar('name',          { length: 255 }),
  plan:          varchar('plan',          { length: 50  }).default('free'),
  planExpiresAt: timestamp('planExpiresAt'),
  monthlyLimit:  integer('monthlyLimit').default(10),
  createdAt:     timestamp('createdAt').defaultNow().notNull(),
  updatedAt:     timestamp('updatedAt').defaultNow().notNull(),
})

// Primary content record — replaces AIOutput as source of truth
export const contentPieces = pgTable('content_pieces', {
  id:           serial('id').primaryKey(),
  userId:       varchar('userId',        { length: 128 }).notNull(),
  userEmail:    varchar('userEmail',     { length: 255 }),
  templateSlug: varchar('templateSlug', { length: 255 }),
  formData:     text('formData'),
  aiResponse:   text('aiResponse'),
  title:        varchar('title',        { length: 500 }),
  modelUsed:    varchar('modelUsed',    { length: 100 }), // future billing
  tokenCount:   integer('tokenCount'),                    // future billing
  createdAt:    timestamp('createdAt').defaultNow().notNull(),
  updatedAt:    timestamp('updatedAt').defaultNow().notNull(),
})

// OAuth-connected social accounts — tokens encrypted at rest via utils/encryption.ts
export const socialAccounts = pgTable('social_accounts', {
  id:                serial('id').primaryKey(),
  userId:            varchar('userId',            { length: 128 }).notNull(),
  platform:          varchar('platform',          { length: 50  }).notNull(),
  platformAccountId: varchar('platformAccountId', { length: 255 }),
  handle:            varchar('handle',            { length: 255 }),
  accessTokenEnc:    text('accessTokenEnc'),
  refreshTokenEnc:   text('refreshTokenEnc'),
  tokenExpiresAt:    timestamp('tokenExpiresAt'),
  instanceUrl:       varchar('instanceUrl',       { length: 500 }), // Mastodon
  metadata:          text('metadata'),
  isActive:          boolean('isActive').default(true).notNull(),
  createdAt:         timestamp('createdAt').defaultNow().notNull(),
  updatedAt:         timestamp('updatedAt').defaultNow().notNull(),
}, (t) => ({
  userPlatformIdx: uniqueIndex('sa_user_platform_account_idx')
    .on(t.userId, t.platform, t.platformAccountId),
}))

// Platform-tailored variants derived from a master content_piece
export const repurposedVariants = pgTable('repurposed_variants', {
  id:             serial('id').primaryKey(),
  contentPieceId: integer('contentPieceId').notNull()
                    .references(() => contentPieces.id, { onDelete: 'cascade' }),
  platform:       varchar('platform',    { length: 50 }).notNull(),
  variantType:    varchar('variantType', { length: 50 }).notNull(),
  variantData:    text('variantData').notNull(),  // Zod-validated JSON
  editedData:     text('editedData'),             // user's override of variantData
  createdAt:      timestamp('createdAt').defaultNow().notNull(),
  updatedAt:      timestamp('updatedAt').defaultNow().notNull(),
})

// Publish queue — idempotencyKey UNIQUE prevents double-posts on retry
export const scheduledPosts = pgTable('scheduled_posts', {
  id:              serial('id').primaryKey(),
  userId:          varchar('userId',         { length: 128 }).notNull(),
  variantId:       integer('variantId')
                     .references(() => repurposedVariants.id, { onDelete: 'set null' }),
  socialAccountId: integer('socialAccountId')
                     .references(() => socialAccounts.id,     { onDelete: 'cascade' }),
  platform:        varchar('platform',       { length: 50  }).notNull(),
  contentSnapshot: text('contentSnapshot').notNull(),
  scheduledAt:     timestamp('scheduledAt').notNull(),
  // 'queued' | 'posting' | 'posted' | 'failed' | 'cancelled'
  status:          varchar('status',         { length: 50  }).default('queued').notNull(),
  idempotencyKey:  varchar('idempotencyKey', { length: 255 }).notNull().unique(),
  retryCount:      integer('retryCount').default(0).notNull(),
  nextRetryAt:     timestamp('nextRetryAt'),
  postedAt:        timestamp('postedAt'),
  platformPostId:  varchar('platformPostId', { length: 500 }),
  createdAt:       timestamp('createdAt').defaultNow().notNull(),
  updatedAt:       timestamp('updatedAt').defaultNow().notNull(),
})

// Immutable audit trail — one row per publish attempt
export const postLogs = pgTable('post_logs', {
  id:               serial('id').primaryKey(),
  scheduledPostId:  integer('scheduledPostId').notNull()
                      .references(() => scheduledPosts.id, { onDelete: 'cascade' }),
  attempt:          integer('attempt').notNull(),
  status:           varchar('status', { length: 50 }).notNull(), // 'success' | 'error'
  errorMessage:     text('errorMessage'),
  platformResponse: text('platformResponse'),
  attemptedAt:      timestamp('attemptedAt').defaultNow().notNull(),
})
