const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const eventTable = "CanvasEvents";

async function updateEvent(eventId, body, loggedInUser) {
  const event = await getEventById(eventId);

  if (!event) {
    return utils.buildResponse(404, { message: "Event not found." });
  }

  if (event.ownerUsername !== loggedInUser.username) {
    return utils.buildResponse(403, {
      message: "Forbidden: You are not the owner of this event.",
    });
  }

  const { name, date, venue, promoterUsername, gymId } = body;

  const params = {
    TableName: eventTable,
    Key: { eventId: eventId },
    UpdateExpression: "SET #ua = :ua",
    ExpressionAttributeNames: {
      "#ua": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":ua": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  if (name !== undefined) {
    params.UpdateExpression += ", #n = :n";
    params.ExpressionAttributeNames["#n"] = "name";
    params.ExpressionAttributeValues[":n"] = name;
  }

  if (date !== undefined) {
    params.UpdateExpression += ", #d = :d";
    params.ExpressionAttributeNames["#d"] = "date";
    params.ExpressionAttributeValues[":d"] = date;
  }

  if (venue !== undefined) {
    params.UpdateExpression += ", #v = :v";
    params.ExpressionAttributeNames["#v"] = "venue";
    params.ExpressionAttributeValues[":v"] = venue;
  }

  if (promoterUsername !== undefined) {
    params.UpdateExpression += ", #pu = :pu";
    params.ExpressionAttributeNames["#pu"] = "promoterUsername";
    params.ExpressionAttributeValues[":pu"] = promoterUsername;
  }

  if (gymId !== undefined) {
    params.UpdateExpression += ", #gi = :gi";
    params.ExpressionAttributeNames["#gi"] = "gymId";
    params.ExpressionAttributeValues[":gi"] = gymId;
  }

  if (Object.keys(params.ExpressionAttributeValues).length === 1) {
    return utils.buildResponse(400, {
      message: "No valid fields provided to update.",
    });
  }

  try {
    const response = await dynamoDB.update(params).promise();
    return utils.buildResponse(200, response.Attributes);
  } catch (error) {
    console.error("Error in updateEvent:", error);
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

module.exports.updateEvent = updateEvent;
