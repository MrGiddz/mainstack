import express, { NextFunction, Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes";
import { MONGODB_URL, PORT } from "./lib/config";
import logger from "./lib/logger";
import path from "path";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  logger.info(`[${timestamp}] ${method} ${url} - Request received`);

  res.on("finish", () => {
    const responseTime = new Date().toISOString();
    const { statusCode } = res;
    logger.info(
      `[${responseTime}] ${method} ${url} - Response sent with status ${statusCode}`
    );
  });

  next();
});

app.use(
  cors({
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "welcome.html"));
});

app.use("/api", router());

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

// General Error Handler
app.use((err: any, req: Request, res: Response) => {
  logger.error(`Error: ${err.message}`);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

mongoose.Promise = Promise;

try {
  mongoose.connect(MONGODB_URL);

  mongoose.connection.once("open", () => {
    logger.info("connected to mongodb");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(err);
  });
} catch (error) {
  logger.error(error);
  logger.error(`App failed to start.`);
}
const server = http.createServer(app);

server.listen(PORT, async () => {
  logger.info(`App is running at http://localhost:${PORT}`);
});

// Gracefully close the server during tests
export const closeServer = () => {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
};

export default app;
