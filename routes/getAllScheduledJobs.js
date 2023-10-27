import express from "express";
import schedule from "node-schedule";

const router = express.Router();

//schedule campaign
router.get("/", async function (req, res) {
  const scheduledJobs = Object.keys(schedule.scheduledJobs);
  res.status(200).json({ status: true, data: scheduledJobs });
});

export default router;
