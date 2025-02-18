import { Router } from "express";

import Validate from "../lib/validator";
import { createProductSchema, loginSchema, signupSchema } from "../schemas/index";
import { login, register } from "../controllers/auth.controller";
import { createProduct, deleteProduct, getProductByNameOrID, updateProduct,  } from "../controllers/product.controller";
import { authenticateUser, AuthRequest } from "../middleware/index";

export default (router: Router) => {
  const product = Router();

  product.post("/create", Validate(createProductSchema), authenticateUser, (req, res) => createProduct(req as AuthRequest, res));

  product.put("/:id/update-quantity", authenticateUser, (req, res) => updateProduct(req as AuthRequest, res));


  product.get("/:value", (req, res) => getProductByNameOrID(req, res));
  product.delete("/:id", authenticateUser, (req, res) => deleteProduct(req, res));

  router.use("/product", product);
};
