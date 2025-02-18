import { Router } from "express";
import auth from "./auth";
import product from "./product";
const router = Router();

export default (): Router => {
  auth(router);
  product(router);
  return router;
};
