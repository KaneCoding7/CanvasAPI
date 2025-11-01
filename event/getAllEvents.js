const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const eventTable = "CanvasEvents";

async function getAllEvents() {
  try {
    const params = {
      TableName: eventTable,
    };

    const response = await dynamoDB.scan(params).promise();

    return utils.buildResponse(200, response.Items || []);
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.getAllEvents = getAllEvents;
