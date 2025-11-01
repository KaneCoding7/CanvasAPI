const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const refProfileTable = "CanvasRefProfiles";

async function deleteRefProfile(requestedUsername, loggedInUser) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot delete another user's referee profile.",
    });
  }

  const params = {
    TableName: refProfileTable,
    Key: { username: requestedUsername },
    ConditionExpression: "attribute_exists(username)",
  };

  try {
    await dynamoDB.delete(params).promise();
    return utils.buildResponse(200, {
      message: "Referee profile deleted successfully.",
    });
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return utils.buildResponse(404, {
        message: "Referee profile not found.",
      });
    }
    console.error("Error in deleteRefProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.deleteRefProfile = deleteRefProfile;
