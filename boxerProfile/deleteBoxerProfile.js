const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boxerProfileTable = "CanvasBoxerProfiles";

async function deleteBoxerProfile(requestedUsername, loggedInUser) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot delete another user's boxer profile.",
    });
  }

  const params = {
    TableName: boxerProfileTable,
    Key: { username: requestedUsername },
    ConditionExpression: "attribute_exists(username)",
  };

  try {
    await dynamoDB.delete(params).promise();
    return utils.buildResponse(200, {
      message: "Boxer profile deleted successfully.",
    });
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return utils.buildResponse(404, { message: "Boxer profile not found." });
    }
    console.error("Error in deleteBoxerProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.deleteBoxerProfile = deleteBoxerProfile;
