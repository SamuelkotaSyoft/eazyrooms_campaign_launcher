import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import "./firebase-config.js";

const app = express();
const port = 3012;

app.use(cors());
app.use(express.json());

/**
 *
 * dotenv config
 */
const __dirname = path.resolve();
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

/**
 *
 * connect to mongodb
 */
await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
console.log("MONGODB CONNECTED...");

/**
 *
 * routes
 */

app.use(
  "/launchCampaign",
  (await import("./routes/launchCampaign.js")).default
);

app.use(
  "/scheduleCampaign",
  (await import("./routes/scheduleCampaign.js")).default
);

app.use(
  "/getAllScheduledJobs",
  (await import("./routes/getAllScheduledJobs.js")).default
);

/**
 *
 * start listening to requests
 */
app.listen(port, () => {
  console.log(`Campaign Launcher Service listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", service: "Campaign Launcher Service" });
});
