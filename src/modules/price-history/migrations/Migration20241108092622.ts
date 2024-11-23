import { Migration } from '@mikro-orm/migrations';

export class Migration20241108092622 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "price_history" ("id" text not null, "currency_code" text not null, "amount" numeric not null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_history_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "price_history" cascade;');
  }

}
