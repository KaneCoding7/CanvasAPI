const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const eventTable = "CanvasEvents";

async function getEvent(eventId) {
  if (!eventId) {
    return utils.buildResponse(400, {
      message: "eventId missing from URL path",
    });
  }

  try {
    const params = {
      TableName: eventTable,
      Key: { eventId: eventId },
    };

    const response = await dynamoDB.get(params).promise();

    if (!response.Item) {
      return utils.buildResponse(404, { message: "Event not found." });
    }

    return utils.buildResponse(200, response.Item);
  } catch (error) {
    console.error("Error in getEvent:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.getEvent = getEvent;
