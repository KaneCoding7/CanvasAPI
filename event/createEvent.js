const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const Event = require("./event");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const eventTable = "CanvasEvents";

async function createEvent(loggedInUser, body) {
  const { name, date, venue } = body;
  if (!name || !date || !venue) {
    return utils.buildResponse(400, {
      message: "name, date, and venue are required.",
    });
  }

  const newEvent = new Event(loggedInUser, body);

  const saved = await saveEvent(newEvent);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating event. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Event created successfully",
    event: newEvent,
  });
}

async function saveEvent(eventItem) {
  const params = {
    TableName: eventTable,
    Item: eventItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveEvent:", error);
        return false;
      }
    );
}

module.exports.createEvent = createEvent;
