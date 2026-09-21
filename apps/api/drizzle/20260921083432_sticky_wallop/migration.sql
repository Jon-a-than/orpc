CREATE TABLE "accounts" (
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwkss" (
	"alg" text,
	"created_at" timestamp NOT NULL,
	"crv" text,
	"expires_at" timestamp,
	"id" text PRIMARY KEY,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"token" text NOT NULL UNIQUE,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;