const Joi = require("joi");

const participantsSchema = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().required().email(),
  rsvp: Joi.required(),
});

const meetingsValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    participants: Joi.array().items(participantsSchema).min(1).required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = { meetingsValidation };
