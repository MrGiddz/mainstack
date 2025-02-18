import request from "supertest";
import app, { closeServer } from "../index";
import { HttpStatusCode } from "axios";
import ProductModel from "../models/product.model";
import mongoose from "mongoose";
// Import the closeServer function

let testUser = {
  username: "user01",
  email: "email1@example.com",
  password: "password",
};

let testProduct = {
  name: "clothes",
  price: 100,
  quantity: 10,
};

describe("Product End to End Tests", () => {
  let productId: string;
  let token: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL!);
     await request(app)
      .post("/api/auth/register")
      .send(testUser);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ username: testUser.username, password: testUser.password });


    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await closeServer();
    await ProductModel.deleteMany({});
    await mongoose.connection.close();
  });

  it("should create a product", async () => {
    const response = await request(app)
      .post("/api/product/create")
      .set("Authorization", `Bearer ${token}`)
      .send(testProduct);

    expect(response.status).toBe(HttpStatusCode.Created);
    expect(response.body.message).toBe("Product created successfully");
    expect(response.body.product).toHaveProperty("name", testProduct.name);

    productId = response.body.product.id;

  });

  it("should update the product", async () => {
    const response = await request(app)
      .put(`/api/product/${productId}/update-quantity`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Product Name",
        quantity: 20,
        price: 150,
      });

    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body.message).toBe("Product updated successfully");
    expect(response.body.product).toHaveProperty(
      "name",
      "Updated Product Name"
    );
    expect(response.body.product).toHaveProperty("quantity", 20);
  });

  it("should get a product by name", async () => {
    const response = await request(app).get(`/api/product/${testProduct.name}`);

    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body.product).toHaveProperty("name", testProduct.name);
  });

  it("should get a product by id", async () => {
    const response = await request(app).get(`/product/${productId}`);

    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body.product).toHaveProperty("id", productId);
  });

  it("should delete a product", async () => {
    const response = await request(app)
      .delete(`/api/product/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body.message).toBe("Product deleted successfully");
  });

  it("should return 404 when deleting a non-existent product", async () => {
    const response = await request(app)
      .delete(`/api/product/non-existent-id`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(HttpStatusCode.NotFound);
    expect(response.body.error).toBe("Product not found");
  });
});
