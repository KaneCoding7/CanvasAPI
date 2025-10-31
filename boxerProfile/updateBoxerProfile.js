const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boxerProfileTable = "CanvasBoxerProfiles";

async function updateBoxerProfile(requestedUsername, loggedInUser, body) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot update another user's boxer profile.",
    });
  }

  const { weightClass, usaBoxingNumber, wins, losses, gymId } = body;

  const params = {
    TableName: boxerProfileTable,
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

  if (weightClass !== undefined) {
    params.UpdateExpression += ", #wc = :wc";
    params.ExpressionAttributeNames["#wc"] = "weightClass";
    params.ExpressionAttributeValues[":wc"] = weightClass;
  }

  if (usaBoxingNumber !== undefined) {
    params.UpdateExpression += ", #ubn = :ubn";
    params.ExpressionAttributeNames["#ubn"] = "usaBoxingNumber";
    params.ExpressionAttributeValues[":ubn"] = usaBoxingNumber;
  }

  if (wins !== undefined) {
    params.UpdateExpression += ", #w = :w";
    params.ExpressionAttributeNames["#w"] = "wins";
    params.ExpressionAttributeValues[":w"] = wins;
  }

  if (losses !== undefined) {
    params.UpdateExpression += ", #l = :l";
    params.ExpressionAttributeNames["#l"] = "losses";
    params.ExpressionAttributeValues[":l"] = losses;
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
    console.error("Error in updateBoxerProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.updateBoxerProfile = updateBoxerProfile;
