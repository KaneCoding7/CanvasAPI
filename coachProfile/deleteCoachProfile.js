const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const coachProfileTable = "CanvasCoachProfiles";

async function deleteCoachProfile(requestedUsername, loggedInUser) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot delete another user's coach profile.",
    });
  }

  const params = {
    TableName: coachProfileTable,
    Key: { username: requestedUsername },
    ConditionExpression: "attribute_exists(username)",
  };

  try {
    await dynamoDB.delete(params).promise();
    return utils.buildResponse(200, {
      message: "Coach profile deleted successfully.",
    });
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return utils.buildResponse(404, { message: "Coach profile not found." });
    }
    console.error("Error in deleteCoachProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.deleteCoachProfile = deleteCoachProfile;
