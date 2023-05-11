const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the frontend files
app.use(express.static("views"));

// Mongoose schema and model
const videoSchema = new mongoose.Schema({
  frames: [String],
});

const Video = mongoose.model("Video", videoSchema);
io.on("connection", (socket) => {
  console.log("A client connected");

  // Handle video frame data sent by the frontend
  socket.on("storeVideo", (frames) => {
    // Create a new video object with the received frames
    const video = new Video({ frames });

    // Save the video object to the database
    video
      .save()
      .then(() => {
        console.log("Video stored successfully");
      })
      .catch((error) => {
        console.error("Error storing video:", error);
      });
  });

  // Handle request for recorded videos
  socket.on("requestRecordedVideos", () => {
    // Retrieve all videos from the database
    Video.find()
      .then((videos) => {
        // Extract frames from each video and send them to the client
        const recordedVideos = videos.map((video) => video.frames);
        socket.emit("sendRecordedVideos", recordedVideos);
      })
      .catch((error) => {
        console.error("Error retrieving videos:", error);
      });
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Additional event emitter to send all videos to the frontend
Video.on("index", () => {
  // Retrieve all videos from the database
  Video.find()
    .then((videos) => {
      const recordedVideos = videos.map((video) => video.frames);
      io.emit("sendRecordedVideos", recordedVideos);
    })
    .catch((error) => {
      console.error("Error retrieving videos:", error);
    });
});

mongoose
  .connect(
    "mongodb+srv://lokesh:ahire@cluster0.entjnlc.mongodb.net/MPYGAssignment?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Serve server.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
