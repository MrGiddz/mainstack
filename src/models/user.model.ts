import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface AuthInfo {
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  recoveryToken?: string;
  recoveryTokenExpires?: Date;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  auth: AuthInfo;

  comparePassword(password: string): Promise<boolean>;
  setPasswordResetToken(token: string | null,  expiry: Date | null): Promise<void>;
  setRefreshToken(token: string,  expiry: Date): Promise<void>;
}

export interface UserModel extends Model<User> {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  createUser(username: string, email: string, password: string): Promise<User>;
}

const userSchema = new mongoose.Schema<User>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    auth: {
      resetPasswordOTP: { type: String },
      resetPasswordOTPExpires: { type: Number },
      recoveryToken: { type: String },
      recoveryTokenExpires: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.auth;
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Hash Password Before Saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare Passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Set Password Reset Token
userSchema.methods.setPasswordResetToken = async function (token: string | null, expiry: Date | null) {
  this.auth.resetPasswordOTP = token;
  this.auth.resetPasswordOTPExpires = expiry
  await this.save()
};

// Set Password Reset Token
userSchema.methods.setRefreshToken = async function (token: string, expiry: Date) {
  this.auth.recoveryToken = token;
  this.auth.recoveryTokenExpires = expiry
  await this.save()
};

// Find User by Username
userSchema.statics.findByUsername = function (username: string): Promise<User | null> {
  return this.findOne({ username });
};

// Find User by Email
userSchema.statics.findByEmail = function (email: string): Promise<User | null> {
  return this.findOne({ email });
};

// Create User
userSchema.statics.createUser = async function (username: string,password: string, email: string): Promise<User> {
  const user = new this({ username, email, password });
  await user.save();
  return user;
};

const UserModel = mongoose.model<User, UserModel>("User", userSchema);

export default UserModel;
