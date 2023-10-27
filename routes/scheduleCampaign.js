import express from "express";
import schedule from "node-schedule";
import sendWATemplateMessage from "../helpers/sendWATemplateMessage.js";
import verifyToken from "../helpers/verifyToken.js";
import Campaign from "../models/campaignModel.js";
import User from "../models/userModel.js";

const router = express.Router();

//schedule campaign
router.post("/", verifyToken, async function (req, res) {
  const scheduleDateTime = req.body.scheduleDateTime;

  const job = schedule.scheduleJob(
    "campaign",
    new Date(scheduleDateTime),
    async function () {
      try {
        const uid = req.user_info.main_uid;
        const role = req.user_info.role;
        const campaignId = req.body.campaignId;

        //validate userId
        if (!uid) {
          res.status(400).json({ status: false, error: "uid is required" });
          return;
        }

        //validate name
        if (!campaignId) {
          res
            .status(400)
            .json({ status: false, error: "campaignId is required" });
          return;
        }

        if (role !== "propertyAdmin" && role !== "locationAdmin") {
          res.status(403).json({ status: false, error: "Unauthorized" });
          return;
        }
        //check if user exists
        const user = await User.findOne({ uid: uid });
        if (!user) {
          // console.log("NO USER");
          res.status(400).json({ status: false, error: "Invalid userId" });
          return;
        }

        const campaign = await Campaign.findById(campaignId).populate(
          "template lists"
        );
        console.log({ campaign });

        //update campaign status to running
        await Campaign.updateOne(
          { _id: campaignId },
          {
            $set: {
              campaignStatus: "running",
            },
          },
          { new: true }
        );
        if (campaign.template.templateStatus === "approved") {
          let result = await sendWATemplateMessage({
            template: campaign.template,
            list: campaign.lists,
            variables: campaign.variables,
          });
          console.log({ result });
          await Campaign.updateOne(
            { _id: campaignId },
            {
              $set: {
                campaignStatus: "completed",
              },
            },
            { new: true }
          );

          //save campaign results
          await Campaign.updateOne(
            { _id: campaignId },
            {
              $set: {
                results: [
                  ...campaign.results,
                  {
                    launchDateTime: scheduleDateTime,
                    successful: result.successfulResults,
                    failed: result.failedResults,
                  },
                ],
              },
            },
            { new: true }
          );
        }

        //update campaign status to completed

        //send response to client
      } catch (err) {
        console.log({ err });
      }
    }
  );

  res.status(200).json({ status: true, data: "campaign scheduled" });
});

export default router;
