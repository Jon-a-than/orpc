CREATE TABLE "tasks" (
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"creator_id" text NOT NULL,
	"description" text NOT NULL,
	"title" text NOT NULL
);
