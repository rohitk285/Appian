const mongoose = require("mongoose");

const aadharSchema = new mongoose.Schema(
  {
    name: { type: Object, required: true },
    nameHash: { type: String, required: true },
    fileLink: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aadhar", aadharSchema);
