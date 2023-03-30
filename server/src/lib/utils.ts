import Router from "@koa/router";
import Koa from "koa";

export function dynamicallyRegisterRouter(router: Router) {
  return function _controllerRegistrator(app: Koa) {
    app.use(router.routes());
  };
}
