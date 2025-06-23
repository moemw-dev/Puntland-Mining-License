// import { relations } from "drizzle-orm";

import { relations, sql } from "drizzle-orm";
import {
  varchar,
  uuid,
  text,
  decimal,
  pgTable,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// 👉 Role Enum
export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN",
  "MINISTER",
  "GENERAL_DIRECTOR",
  "DIRECTOR",
  "OFFICER",
]);

// 👉 License Status Enum
export const licenseStatusEnum = pgEnum("license_status", [
  "PENDING",
  "APPROVED",
  "REVOKED",
]);

// 👉 Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: roleEnum("role").default("OFFICER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 👉 Regions Table
export const regions = pgTable("regions", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 👉 Districts Table
export const districts = pgTable("districts", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  region_id: uuid("region_id")
    .notNull()
    .references(() => regions.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 👉 Licenses Table
export const licenses = pgTable("licenses", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  license_ref_id: varchar("license_ref_id", { length: 255 }).notNull().unique(),

  // 👉 STEP 1 - Company Info
  company_name: varchar("company_name", { length: 255 }).notNull(),
  business_type: varchar("business_type", { length: 255 }).notNull(),
  company_address: text("company_address"),
  region: varchar("region", { length: 255 }),
  district_id: uuid("district_id")
    .notNull()
    .references(() => districts.id),
  country_of_origin: varchar("country_of_origin", { length: 255 }),

  // 👉 License Status
  status: licenseStatusEnum("status").default("PENDING").notNull(),

  // 👉 Link to district (not region)

  // 👉 STEP 2 - Personal Info
  full_name: varchar("full_name", { length: 255 }),
  mobile_number: varchar("mobile_number", { length: 255 }),
  email_address: text("email_address"),
  id_card_number: varchar("id_card_number", { length: 255 }),

  // 👉 STEP 3 - Document Info
  passport_photos: text("passport_photos"),
  company_profile: text("company_profile"),
  receipt_of_payment: text("receipt_of_payment"),
  environmental_assessment_plan: text("environmental_assessment_plan"),
  experience_profile: text("experience_profile"),
  risk_management_plan: text("risk_management_plan"),
  bank_statement: text("bank_statement"),

  // 👉 STEP 4 - License Info
  license_type: varchar("license_type", { length: 255 }),
  license_category: varchar("license_category", { length: 255 }),
  calculated_fee: decimal("calculated_fee", { precision: 10, scale: 2 }),
  license_area: text("license_area").array(),

  // 👉 STEP 5 - Signature true/false
  signature: boolean("signature").default(false),

  // 👉 Dates
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),

  expire_date: timestamp("expire_date", { withTimezone: true })
    .notNull()
    .default(sql`NOW() + interval '1 year'`),
});

// 👉 Sample Analysis Table
export const sampleAnalysis = pgTable("sample_analysis", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  ref_id: varchar("license_ref_id", { length: 255 }).notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  nationality: varchar("nationality", { length: 255 }).notNull(),
  passport_no: varchar("passport_no", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  kilo_gram: decimal("kilo_gram", { precision: 10, scale: 2 }).notNull(),
  mineral_type: varchar("mineral_type", { length: 255 }).notNull(),

  signature: boolean("signature").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 👉 Relations for Drizzle ORM (optional, for easier querying)
export const districtRelations = relations(districts, ({ one, many }) => ({
  region: one(regions, {
    fields: [districts.region_id],
    references: [regions.id],
  }),
  licenses: many(licenses),
}));

export const licenseRelations = relations(licenses, ({ one }) => ({
  district: one(districts, {
    fields: [licenses.district_id],
    references: [districts.id],
  }),
}));
