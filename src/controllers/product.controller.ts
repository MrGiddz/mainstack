import { Request, Response } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/index";
import { HttpStatusCode } from "axios";

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, quantity } = req.body;
    const user = req.user;

    console.log({ user });

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
      .status(HttpStatusCode.Created)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Product creation failed" });
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
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Failed to update product" });
  }
};

export const fetchAllProduct = async (req: Request, res: Response) => {
  try {
    const { name, id } = req.query;
    console.log({ query: req.query });
    let products;

    console.log("Fetching products with name:", name);

    if (name) {
      products = await Product.findByName(name as string);
      console.log("Products found by name:", products);
      return res.status(HttpStatusCode.Ok).json({
        message: "Products retrieved successfully",
        product: products || [],
      });
    }

    if (id) {
      products = await Product.findById(id);
      console.log("Products found by id:", products);
      return res.status(HttpStatusCode.Ok).json({
        message: "Product retrieved successfully",
        product: products,
      });
    }
    products = await Product.findAll();
    console.log("All products retrieved:", products);
    return res.status(HttpStatusCode.Ok).json({
      message: "Product retrieved successfully",
      product: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Failed to fetch products" });
  }
};

export const getProductByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    console.log({ name });
    const product = await Product.findByName(name);
    if (!product) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Failed to retrieve product" });
  }
};
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log({ id });
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Failed to retrieve product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.deleteProduct(id);

    if (!deletedProduct) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Failed to delete product" });
  }
};
