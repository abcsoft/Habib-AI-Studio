ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_brand_kit_id_brand_kits_id_fk";
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brand_kit_id_brand_kits_id_fk" FOREIGN KEY ("brand_kit_id") REFERENCES "public"."brand_kits"("id") ON DELETE cascade ON UPDATE no action;