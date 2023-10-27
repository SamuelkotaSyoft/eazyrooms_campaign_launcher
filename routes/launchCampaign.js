import express from "express";
import * as fs from "firebase-admin/firestore";
import sendWATemplateMessage from "../helpers/sendWATemplateMessage.js";
import verifyToken from "../helpers/verifyToken.js";
import Campaign from "../models/campaignModel.js";
import User from "../models/userModel.js";
const Template = await import("../models/templateModel.js").default;
const List = await import("../models/listModel.js").default;

const fb = fs.getFirestore();

var router = express.Router();

//create chatbot
router.get("/:campaignId", verifyToken, async function (req, res) {
  try {
    const uid = req.user_info.main_uid;

    const campaignId = req.params.campaignId;
    const role = req.user_info.role;

    //validate userId
    if (!uid) {
      res.status(400).json({ status: false, error: "uid is required" });
      return;
    }

    //validate name
    if (!campaignId) {
      res.status(400).json({ status: false, error: "campaignId is required" });
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

    let launchDateTime = Date.now();

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

      //update campaign status to completed
      await Campaign.updateOne(
        { _id: campaignId },
        {
          $set: {
            campaignStatus: "completed",
          },
        },
        { new: true }
      );

      //update campaign status to completed
      await Campaign.updateOne(
        { _id: campaignId },
        {
          $set: {
            results: [
              ...campaign.results,
              {
                launchDateTime: launchDateTime,
                successful: result.successfulResults,
                failed: result.failedResults,
              },
            ],
          },
        },
        { new: true }
      );

      res.status(200).json({ status: true, data: result });
    } else {
      res
        .status(400)
        .json({ status: false, error: "Unable to Send Campaigns" });
    }

    //send response to client
  } catch (err) {
    console.log({ err });
    res.status(500).json({ error: err });
  }
});

export default router;
