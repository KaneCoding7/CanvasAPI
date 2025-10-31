const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boxerProfileTable = "CanvasBoxerProfiles";

async function getBoxerProfile(requestedUsername, loggedInUser) {
  if (!requestedUsername) {
    return utils.buildResponse(400, {
      message: "Username missing from URL path",
    });
  }

  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot access another user's boxer profile.",
    });
  }

  try {
    const params = {
      TableName: boxerProfileTable,
      Key: { username: requestedUsername },
    };

    const response = await dynamoDB.get(params).promise();

    if (!response.Item) {
      return utils.buildResponse(404, { message: "Boxer profile not found." });
    }

    return utils.buildResponse(200, response.Item);
  } catch (error) {
    console.error("Error in getBoxerProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.getBoxerProfile = getBoxerProfile;
