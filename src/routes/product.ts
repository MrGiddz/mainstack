import { Router } from "express";

import Validate from "../lib/validator";
import { createProductSchema, loginSchema, signupSchema } from "../schemas/index";
import { login, register } from "../controllers/auth.controller";
import { createProduct, deleteProduct, fetchAllProduct, getProductById, getProductByName, updateProduct,  } from "../controllers/product.controller";
import { authenticateUser, AuthRequest } from "../middleware/index";

export default (router: Router) => {
  const product = Router();

  product.post("/create", Validate(createProductSchema), authenticateUser, (req, res) => createProduct(req as AuthRequest, res));

  product.put("/:id/update", authenticateUser, (req, res) => updateProduct(req as AuthRequest, res));


  product.get("/:id", getProductById);
  product.get("/", fetchAllProduct);
  product.get("/product/:name", getProductByName)
  product.delete("/:id", authenticateUser, (req, res) => deleteProduct(req, res));

  router.use("/product", product);
};
