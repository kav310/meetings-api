const { v4: uuidv4 } = require("uuid");
const Meetings = require("../models/meetingsModel");
const { meetingsValidation } = require("../validator/meetingValidation");

let date = new Date();

let toDay =
  date.getFullYear().toString().padStart(2, 0) +
  "-" +
  (date.getMonth() + 1).toString().padStart(2, 0) +
  "-" +
  date.getDate().toString().padStart(2, 0);

const createMeeting = async (req, res) => {
  try {
    const { error } = meetingsValidation(req.body);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const { title, startTime, endTime, participants } = req.body;

    let startDate = new Date(toDay + " " + startTime).getTime();
    let endDate = new Date(toDay + " " + endTime).getTime();

    let allEmail = [];
    participants.map((item) => {
      allEmail.push(item.email);
    });

    let overLapQuery = [
      {
        $unwind: "$participants",
      },
      {
        $match: {
          "participants.email": { $in: allEmail },
          "participants.rsvp": "yes",
          startDate: { $gte: startDate },
          endDate: { $lte: endDate },
        },
      },
    ];

    let checkOverLap = [];
    checkOverLap = await Meetings.aggregate(overLapQuery);

    if (!(checkOverLap && checkOverLap.length)) {
      const newMeeting = await new Meetings({
        id: uuidv4(),
        title,
        startDate,
        endDate,
        participants,
      });

      await newMeeting.save();
    }

    res.json({
      message:
        checkOverLap && checkOverLap.length
          ? "The time slot which is booked is not avaliable"
          : "metting created",
      data: checkOverLap,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const { id } = req.query;
    const meeting = await Meetings.findById(id);

    if (!meeting) {
      throw new Error("There is no meeting on this id");
    } else {
      res.json(meeting);
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getMeetingsByTimeFrame = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    let startDate = new Date(toDay + " " + startTime).getTime();
    let endDate = new Date(toDay + " " + endTime).getTime();
    let timeMatch = [
      {
        $match: {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate },
        },
      },
    ];

    const meeting = await Meetings.aggregate(timeMatch);

    if (!meeting) {
      throw new Error("There is no meeting in this time frame");
    } else {
      res.json(meeting);
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getMeetingsOfParticipant = async (req, res) => {
  try {
    const { participant } = req.query;

    let emailMatch = [
      {
        $unwind: "$participants",
      },
      {
        $match: {
          "participants.email": { $in: [participant] },
        },
      },
    ];

    const meeting = await Meetings.aggregate(emailMatch);
    if (!meeting) {
      throw new Error("There is no meeting for this participant");
    } else {
      res.json(meeting);
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const pagination = async (req, res) => {
  const page = Number.parseInt(req.query.page);
  const limit = Number.parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};
  results.totalCount = await Meetings.countDocuments().exec();

  if (endIndex < (await Meetings.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.prev = {
      page: page - 1,
      limit: limit,
    };
  }
  try {
    results.current = await Meetings.find()
      .limit(limit)
      .skip(startIndex)
      .exec();
    res.json(results);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

module.exports = {
  createMeeting,
  getMeetingById,
  getMeetingsByTimeFrame,
  getMeetingsOfParticipant,
  pagination,
};
