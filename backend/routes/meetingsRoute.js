const express = require("express");
const {
  createMeeting,
  getMeetingById,
  getMeetingsByTimeFrame,
  getMeetingsOfParticipant,
  pagination,
} = require("../controlllers/meetingsController");

const router = express.Router();

router.post("/", createMeeting);
router.get("/", getMeetingById);
router.get("/getMeetingByTime", getMeetingsByTimeFrame);
router.get("/getMeetingOfParticipant", getMeetingsOfParticipant);
router.get("/pagination", pagination);

module.exports = router;
