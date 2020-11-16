const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const meetingRoutes = require("./routes/meetingsRoute");

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/meetings", meetingRoutes);

mongoose.connect(
  process.env.ATLAS_URI,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  (error) => {
    if (error) console.log(`error connecting database : ${error}`);
    else console.log("Database is successfully connected");
  }
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
