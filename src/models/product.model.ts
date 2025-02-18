import mongoose, { Document, Model, Mongoose, Schema } from "mongoose";

export interface Product extends Document {
  name: string;
  price: number;
  quantity: number;
  added_by: mongoose.Schema.Types.ObjectId;
}

export interface ProductModel extends Model<Product> {
  findByOrIdName: (value: string) => Promise<Product | null>;
  createProduct: (
    name: string,
    price: number,
    quantity: number,
    added_by: string
  ) => Promise<Product>;
  updateProductQuantity: (
    id: string,
    quantity: number
  ) => Promise<Product | null>;
  updateProduct: (
    id: string,
    name: string,
    quantity: number
  ) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<Product | null>;
  updateQuantity: (quantity: number) => Promise<Product>;
 
}

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.added_by;
        return ret;
      },
    },
  }
);

// Instance method to update the product quantity
productSchema.methods.updateQuantity = async function (
  quantity: number
): Promise<Product> {
  const product = this as Product;
  product.quantity = quantity;
  await product.save();
  return product;
};

// Static method to search a product by its name
productSchema.statics.findByOrIdName = async function (
  value: string
): Promise<Product | null> {
  const searchCriteria = mongoose.Types.ObjectId.isValid(value)
    ? { _id: value }
    : { name: value };

  return this.findOne({ $or: [searchCriteria] });
};

// Static method to create a new product
productSchema.statics.createProduct = async function (
  name: string,
  price: number,
  quantity: number,
  added_by: string
): Promise<Product> {
  const product = new this({ name, price, quantity, added_by });
  await product.save();
  return product;
};

// Static method to update a product's quantity
productSchema.statics.updateProductQuantity = async function (
  id: string,
  quantity: number
): Promise<Product | null> {
  const product = await this.findById(id);
  if (!product) return null;

  product.quantity = quantity;
  await product.save();
  return product;
};

// Static method to update a product's
productSchema.statics.updateProduct = async function (
  id: string,
  name: string,
  quantity: number
): Promise<Product | null> {
  const product = await this.findById(id);
  if (!product) return null;

  if (quantity) product.quantity = quantity;
  if (name) product.name = name;
  await product.save();
  return product;
};
// Static method to update a product's
productSchema.statics.deleteProduct = async function (
  id: string,
): Promise<Product | null> {
  const product = await this.findByIdAndDelete(id);
    return product; 
};

const ProductModel = mongoose.model<Product, ProductModel>(
  "Product",
  productSchema
);

export default ProductModel;
