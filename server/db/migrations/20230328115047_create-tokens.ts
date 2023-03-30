import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("tokens", (table) => {
    table.increments();
    table.string("item_id").unique().notNullable();
    table.string("access_token").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("tokens");
}
