import mongoose from "mongoose";

const campaignSchema = mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Property",
  },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Location",
  },

  name: {
    type: String,
    maxLength: 30,
  },

  description: {
    type: String,
    maxLength: 500,
  },

  campaignStatus: {
    type: String,
    enum: ["pending", "running", "completed"],
  },

  channel: {
    type: String,
  },

  dateTime: {
    type: Date,
  },

  lists: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
  },

  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
  },

  variables: {
    type: Object,
  },

  results: [
    {
      type: Object,
    },
  ],

  status: {
    type: Boolean,
  },
});

export default mongoose.model("Campaign", campaignSchema);
