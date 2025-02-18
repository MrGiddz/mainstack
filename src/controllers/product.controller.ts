import { Request, Response } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/index";
import { HttpStatusCode } from "axios";

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, quantity } = req.body;
    const user = req.user;

    if (!user)
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "You are not authorized to use this resource." });

    const newProduct = await Product.createProduct(
      name,
      price,
      quantity,
      user.id
    );
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Product creation failed" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id)
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ error: "ProductId not provided" });
    const { name, quantity, price } = req.body;
    const updatedProduct = await Product.updateProduct(id, name, quantity);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const getProductByNameOrID = async (req: Request, res: Response) => {
  try {
    const { value } = req.params;
    const product = await Product.findByOrIdName(value);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
