const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const refProfileTable = "CanvasRefProfiles";

async function updateRefProfile(requestedUsername, body, loggedInUser) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot update another user's referee profile.",
    });
  }

  const { licenseNumber, organization, level, region } = body;

  const params = {
    TableName: refProfileTable,
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

  if (licenseNumber !== undefined) {
    params.UpdateExpression += ", #ln = :ln";
    params.ExpressionAttributeNames["#ln"] = "licenseNumber";
    params.ExpressionAttributeValues[":ln"] = licenseNumber;
  }

  if (organization !== undefined) {
    params.UpdateExpression += ", #o = :o";
    params.ExpressionAttributeNames["#o"] = "organization";
    params.ExpressionAttributeValues[":o"] = organization;
  }

  if (level !== undefined) {
    params.UpdateExpression += ", #l = :l";
    params.ExpressionAttributeNames["#l"] = "level";
    params.ExpressionAttributeValues[":l"] = level;
  }

  if (region !== undefined) {
    params.UpdateExpression += ", #r = :r";
    params.ExpressionAttributeNames["#r"] = "region";
    params.ExpressionAttributeValues[":r"] = region;
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
    console.error("Error in updateRefProfile:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.updateRefProfile = updateRefProfile;
