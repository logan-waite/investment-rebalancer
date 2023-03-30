import "dotenv/config";
import path from "path";
import glob from "glob";

import Koa from "koa";
import bodyParser from "koa-bodyParser";
import cors from "@koa/cors";

const app = new Koa();

app.use(bodyParser());
app.use(cors());

glob
  .sync(path.join(__dirname, "**/*-controller.ts"))
  .map((controllerPath) => require(controllerPath))
  .map((controller) => controller.default)
  .forEach((registerController) => registerController(app));

app.listen(8080);
console.log("listening on port 8080");
