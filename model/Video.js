// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  timestamp: { type: Date, default: Date.now },
  videoData: Buffer,
});

module.exports = mongoose.model("Video", videoSchema);
