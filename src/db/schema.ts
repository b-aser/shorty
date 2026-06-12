import {
    mysqlTable, varchar, text, timestamp,
    int, boolean, index
  } from "drizzle-orm/mysql-core";
  
  // ---------- Better Auth required tables ----------
  export const users = mysqlTable("users", {
    id:            varchar("id", { length: 36 }).primaryKey(),
    name:          varchar("name", { length: 255 }).notNull(),
    email:         varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image:         text("image"),
    createdAt:     timestamp("created_at").defaultNow().notNull(),
    updatedAt:     timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  });
  
  export const sessions = mysqlTable("sessions", {
    id:        varchar("id", { length: 36 }).primaryKey(),
    userId:    varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    token:     varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  });
  
  export const accounts = mysqlTable("accounts", {
    id:                   varchar("id", { length: 36 }).primaryKey(),
    userId:               varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    accountId:            varchar("account_id", { length: 255 }).notNull(),
    providerId:           varchar("provider_id", { length: 255 }).notNull(),
    accessToken:          text("access_token"),
    refreshToken:         text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    scope:                varchar("scope", { length: 255 }),
    password:             text("password"),
    createdAt:            timestamp("created_at").defaultNow().notNull(),
    updatedAt:            timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  });
  
  export const verifications = mysqlTable("verifications", {
    id:         varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value:      varchar("value", { length: 255 }).notNull(),
    expiresAt:  timestamp("expires_at").notNull(),
    createdAt:  timestamp("created_at").defaultNow().notNull(),
  });
  
  // ---------- App tables ----------
  export const links = mysqlTable("links", {
    id:             varchar("id", { length: 36 }).primaryKey(),
    userId:         varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    originalUrl:    text("original_url").notNull(),
    shortCode:      varchar("short_code", { length: 50 }).notNull().unique(),
    normalizedCode: varchar("normalized_code", { length: 50 }).notNull().unique(),
    isCustomCode:   boolean("is_custom_code").default(false).notNull(),
    title:          varchar("title", { length: 255 }),
    clicks:         int("clicks").default(0).notNull(),
    active:         boolean("active").default(true).notNull(),
    passwordHash:   varchar("password_hash", { length: 255 }),
    isProtected:    boolean("is_protected").default(false).notNull(),
  
    // UTM parameters — all optional
    utmSource:    varchar("utm_source",   { length: 255 }),  // e.g. twitter, newsletter
    utmMedium:    varchar("utm_medium",   { length: 255 }),  // e.g. social, email, cpc
    utmCampaign:  varchar("utm_campaign", { length: 255 }),  // e.g. summer-sale
    utmTerm:      varchar("utm_term",     { length: 255 }),  // e.g. running+shoes
    utmContent:   varchar("utm_content",  { length: 255 }),  // e.g. banner-a
  
    expiresAt:    timestamp("expires_at"),
    createdAt:    timestamp("created_at").defaultNow().notNull(),
    updatedAt:    timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }, (table) => ({
    shortCodeIdx:      index("short_code_idx").on(table.shortCode),
    normalizedCodeIdx: index("normalized_code_idx").on(table.normalizedCode),
    userIdIdx:         index("user_id_idx").on(table.userId),
    utmCampaignIdx:    index("utm_campaign_idx").on(table.utmCampaign), // for analytics queries
    utmSourceIdx:      index("utm_source_idx").on(table.utmSource),     // for analytics queries
  }));
  
  export const clickEvents = mysqlTable("click_events", {
    id:        varchar("id", { length: 36 }).primaryKey(),
    linkId:    varchar("link_id", { length: 36 }).notNull().references(() => links.id, { onDelete: "cascade" }),
    country:   varchar("country", { length: 100 }),
    city:      varchar("city", { length: 100 }),
    device:    varchar("device", { length: 50 }),    // mobile / desktop / tablet
    browser:   varchar("browser", { length: 100 }),
    os:        varchar("os", { length: 100 }),
    referer:   text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => ({
    linkIdIdx: index("link_id_idx").on(table.linkId),
  }));