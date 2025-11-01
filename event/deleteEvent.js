const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const eventTable = "CanvasEvents";

async function deleteEvent(eventId, loggedInUser) {
  const event = await getEventById(eventId);

  if (!event) {
    return utils.buildResponse(404, { message: "Event not found." });
  }

  if (event.ownerUsername !== loggedInUser.username) {
    return utils.buildResponse(403, {
      message:
        "Forbidden: You are not the owner of this event and cannot delete it.",
    });
  }

  const params = {
    TableName: eventTable,
    Key: { eventId: eventId },
  };

  try {
    await dynamoDB.delete(params).promise();
    return utils.buildResponse(200, {
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

async function getEventById(eventId) {
  const params = {
    TableName: eventTable,
    Key: { eventId: eventId },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => null
    );
}

module.exports.deleteEvent = deleteEvent;
