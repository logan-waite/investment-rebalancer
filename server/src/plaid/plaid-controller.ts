import Router from "@koa/router";
import type { CountryCode, LinkTokenCreateRequest, Products } from "plaid";
import { PlaidApi, Configuration, PlaidEnvironments } from "plaid";
import { getAccessToken, saveAccessToken } from "../database/plaid";
import { dynamicallyRegisterRouter } from "../lib/utils";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const client = new PlaidApi(configuration);

const router = new Router<any, any>({ prefix: "/plaid" });

router.get("/create_link_token", async (ctx) => {
  const id = ctx.query.user_id;
  const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(",") as Products[];
  const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES.split(
    ","
  ) as CountryCode[];
  const config: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: id,
    },
    client_name: "Investment Rebalancer",
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: "en",
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(config);
    ctx.status = 200;
    ctx.body = createTokenResponse.data;
  } catch (e) {
    console.log(e.response.data);
  }
});

router.post("/exchange_public_token", async (ctx) => {
  const publicToken = ctx.request.body.public_token;
  console.log(ctx.request.body);
  console.log({ publicToken });
  try {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;
    const result = await saveAccessToken(itemId, accessToken);
    ctx.status = 200;
    ctx.body = { accessTokenId: result[0] };
  } catch (e) {
    // console.log(e);
    console.log(e.response.data);
  }
});

router.get("/get_investment_data", async (ctx) => {
  // attempt to retrieve access token from db
  const tokenId = ctx.query.tokenId;
  try {
    const data = await getAccessToken(tokenId);
    if (data) {
      const holdingData = (
        await client.investmentsHoldingsGet({
          access_token: data.access_token,
        })
      ).data;

      const accounts = holdingData.accounts.map((account) => {
        const holdings = holdingData.holdings
          .filter((holding) => holding.account_id === account.account_id)
          .map((holding) => {
            const security = holdingData.securities.find(
              (s) => s.security_id === holding.security_id
            );
            return {
              value: holding.institution_value,
              currencyCode: holding.iso_currency_code,
              tickerSymbol: security.ticker_symbol,
              name: security.name,
              type: security.type,
            };
          });

        return {
          name: account.name,
          accountId: account.account_id,
          available: account.balances.available,
          balance: account.balances.current,
          invested: Math.abs(
            account.balances.current - account.balances.available
          ),
          holdings,
        };
      });

      ctx.status = 200;
      ctx.body = accounts;
    } else {
      ctx.status = 404;
      ctx.body = {};
    }
    // if no access token, fail with error code
    // otherwise, get data
  } catch (e) {
    console.log(e);
  }
});

export default dynamicallyRegisterRouter(router);
