CREATE TABLE "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"key" text NOT NULL,
	"mime_type" text DEFAULT 'application/octet-stream' NOT NULL,
	"size_bytes" bigint DEFAULT -1 NOT NULL,
	"meta" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
