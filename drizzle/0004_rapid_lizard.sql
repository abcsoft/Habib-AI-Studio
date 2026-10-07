CREATE TABLE "brand_kits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"industry" text NOT NULL,
	"audience" text NOT NULL,
	"voice" text NOT NULL,
	"colors" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"brand_kit_id" uuid NOT NULL,
	"name" text NOT NULL,
	"product" text NOT NULL,
	"goal" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"prompt" text NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"model" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"prompt" text NOT NULL,
	"prompt_version" text DEFAULT 'habib-campaign-v1' NOT NULL,
	"output" jsonb,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_creation_tokens" integer DEFAULT 0 NOT NULL,
	"credits" integer NOT NULL,
	"provider_request_id" text,
	"duration_ms" integer,
	"error_code" text,
	"refunded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_kits" ADD CONSTRAINT "brand_kits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brand_kit_id_brand_kits_id_fk" FOREIGN KEY ("brand_kit_id") REFERENCES "public"."brand_kits"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_assets" ADD CONSTRAINT "creative_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_assets" ADD CONSTRAINT "creative_assets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_assets" ADD CONSTRAINT "creative_assets_run_id_studio_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."studio_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_runs" ADD CONSTRAINT "studio_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_runs" ADD CONSTRAINT "studio_runs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_kits_user_id_idx" ON "brand_kits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaigns_user_id_idx" ON "campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaigns_project_id_idx" ON "campaigns" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "campaigns_brand_kit_id_idx" ON "campaigns" USING btree ("brand_kit_id");--> statement-breakpoint
CREATE INDEX "creative_assets_user_id_idx" ON "creative_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creative_assets_campaign_id_idx" ON "creative_assets" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "creative_assets_run_id_idx" ON "creative_assets" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "studio_runs_user_id_idx" ON "studio_runs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "studio_runs_campaign_id_idx" ON "studio_runs" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "studio_runs_user_request_unique" ON "studio_runs" USING btree ("user_id","request_id");