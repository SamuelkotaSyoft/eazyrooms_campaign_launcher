import mongoose from "mongoose";

const templateSchema = mongoose.Schema({
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
  },

  language: {
    type: String,
  },

  category: {
    type: String,
  },

  type: {
    type: String,
  },

  components: {
    type: Array,
  },

  templateStatus: {
    type: String,
  },

  namespace: {
    type: String,
  },

  description: {
    type: String,
  },

  subCategory: {
    type: String,
  },
});

export default mongoose.model("Template", templateSchema);
