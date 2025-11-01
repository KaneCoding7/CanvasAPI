const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const coachProfileTable = "CanvasCoachProfiles";

async function getCoachProfile(requestedUsername, loggedInUser) {
  if (!requestedUsername) {
    return utils.buildResponse(400, {
      message: "Username missing from URL path",
    });
  }

  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot access another user's coach profile.",
    });
  }

  try {
    const params = {
      TableName: coachProfileTable,
      Key: { username: requestedUsername },
    };

    const response = await dynamoDB.get(params).promise();

    if (!response.Item) {
      return utils.buildResponse(404, { message: "Coach profile not found." });
    }

    return utils.buildResponse(200, response.Item);
  } catch (error) {
    console.error("Error in getCoachProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.getCoachProfile = getCoachProfile;
