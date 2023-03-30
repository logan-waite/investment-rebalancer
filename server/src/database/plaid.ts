import knex from "knex";
import config from "../../knexfile";

const db = knex(config.development);

export async function getAccessToken(id: number) {
  const result = await db("tokens")
    .where({ id: Number(id) })
    .first();

  return result;
}

export async function saveAccessToken(item_id: string, access_token: string) {
  return await db("tokens").insert({
    item_id: item_id,
    access_token: access_token,
  });
}
