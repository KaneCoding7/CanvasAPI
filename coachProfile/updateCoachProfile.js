const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const coachProfileTable = "CanvasCoachProfiles";

async function updateCoachProfile(requestedUsername, loggedInUser, body) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot update another user's coach profile.",
    });
  }

  const { gymId, certificationNumber } = body;

  const params = {
    TableName: coachProfileTable,
    Key: { username: requestedUsername },
    UpdateExpression: "SET #ua = :ua",
    ExpressionAttributeNames: {
      "#ua": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":ua": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  if (gymId !== undefined) {
    params.UpdateExpression += ", #gi = :gi";
    params.ExpressionAttributeNames["#gi"] = "gymId";
    params.ExpressionAttributeValues[":gi"] = gymId;
  }

  if (certificationNumber !== undefined) {
    params.UpdateExpression += ", #cn = :cn";
    params.ExpressionAttributeNames["#cn"] = "certificationNumber";
    params.ExpressionAttributeValues[":cn"] = certificationNumber;
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
    console.error("Error in updateCoachProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.updateCoachProfile = updateCoachProfile;
