import { Migration } from '@mikro-orm/migrations';

export class Migration20260408AddBots extends Migration {
  override async up(): Promise<void> {
    // Add isBot flag to users table
    this.addSql(
      `ALTER TABLE "users" ADD COLUMN "is_bot" boolean NOT NULL DEFAULT false;`,
    );
    this.addSql(`CREATE INDEX "idx_users_is_bot" ON "users" ("is_bot");`);

    // Create bot_profiles table
    this.addSql(`
      CREATE TABLE "bot_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "display_persona" varchar(50) NOT NULL,
        "backstory" text NULL,
        "behavior_config" jsonb NOT NULL,
        "simulation_status" varchar(20) NOT NULL DEFAULT 'IDLE',
        "home_location" geography(Point, 4326) NULL,
        "roam_radius_km" int NOT NULL DEFAULT 5,
        "last_simulated_at" timestamptz NULL,
        "total_actions" int NOT NULL DEFAULT 0,
        "error_message" varchar(255) NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "bot_profiles_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "bot_profiles_user_id_unique" UNIQUE ("user_id"),
        CONSTRAINT "bot_profiles_user_id_fkey" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
    this.addSql(
      `CREATE INDEX "idx_bot_profiles_simulation_status" ON "bot_profiles" ("simulation_status");`,
    );

    // Create bot_activity_logs table
    this.addSql(`
      CREATE TABLE "bot_activity_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "bot_profile_id" uuid NOT NULL,
        "action_type" varchar(50) NOT NULL,
        "target_id" uuid NULL,
        "metadata" jsonb NULL,
        "success" boolean NOT NULL DEFAULT true,
        "error_message" varchar(255) NULL,
        "executed_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "bot_activity_logs_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "bot_activity_logs_bot_profile_id_fkey" FOREIGN KEY ("bot_profile_id")
          REFERENCES "bot_profiles" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
    this.addSql(
      `CREATE INDEX "idx_bot_activity_logs_profile_time" ON "bot_activity_logs" ("bot_profile_id", "executed_at" DESC);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "bot_activity_logs";`);
    this.addSql(`DROP TABLE IF EXISTS "bot_profiles";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_users_is_bot";`);
    this.addSql(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_bot";`);
  }
}
