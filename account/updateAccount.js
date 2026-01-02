const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const accountTable = "CanvasAccounts";

async function updateAccount(requestedUsername, body, loggedInUser) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot update another user's account.",
    });
  }

  const { firstName, lastName, email, bio, phone, profilePicUrl } = body;

  const params = {
    TableName: accountTable,
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

  if (firstName !== undefined) {
    params.UpdateExpression += ", #fn = :fn";
    params.ExpressionAttributeNames["#fn"] = "firstName";
    params.ExpressionAttributeValues[":fn"] = firstName;
  }

  if (lastName !== undefined) {
    params.UpdateExpression += ", #ln = :ln";
    params.ExpressionAttributeNames["#ln"] = "lastName";
    params.ExpressionAttributeValues[":ln"] = lastName;
  }

  if (email !== undefined) {
    params.UpdateExpression += ", #em = :em";
    params.ExpressionAttributeNames["#em"] = "email";
    params.ExpressionAttributeValues[":em"] = email;
  }

  if (bio !== undefined) {
    params.UpdateExpression += ", #b = :b";
    params.ExpressionAttributeNames["#b"] = "bio";
    params.ExpressionAttributeValues[":b"] = bio;
  }

  if (phone !== undefined) {
    params.UpdateExpression += ", #ph = :ph";
    params.ExpressionAttributeNames["#ph"] = "phone";
    params.ExpressionAttributeValues[":ph"] = phone;
  }

  if (profilePicUrl !== undefined) {
    params.UpdateExpression += ", #ppu = :ppu";
    params.ExpressionAttributeNames["#ppu"] = "profilePicUrl";
    params.ExpressionAttributeValues[":ppu"] = profilePicUrl;
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
    console.error("Error in updateAccount:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.updateAccount = updateAccount;
