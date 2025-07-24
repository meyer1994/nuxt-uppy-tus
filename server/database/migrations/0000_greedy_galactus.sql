CREATE TABLE "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"meta" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
