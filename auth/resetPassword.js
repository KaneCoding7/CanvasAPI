const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const bcrypt = require("bcryptjs");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const userTable = "CanvasUsers";
const resetTokenTable = "CanvasPasswordResetTokens";

async function resetPassword(body) {
  const { token, newPassword } = body;

  if (!token || !newPassword) {
    return utils.buildResponse(400, {
      message: "Token and newPassword are required.",
    });
  }

  const tokenParams = {
    TableName: resetTokenTable,
    Key: { token: token },
  };
  const tokenData = await dynamoDB.get(tokenParams).promise();
  const resetItem = tokenData.Item;

  if (!resetItem) {
    return utils.buildResponse(400, { message: "Invalid or expired token." });
  }

  const now = Math.floor(Date.now() / 1000);
  if (resetItem.expiresAt < now) {
    return utils.buildResponse(400, { message: "Token expired." });
  }

  const encryptedPW = bcrypt.hashSync(newPassword.trim(), 10);

  const updateParams = {
    TableName: userTable,
    Key: { username: resetItem.username },
    UpdateExpression: "set password = :p",
    ExpressionAttributeValues: {
      ":p": encryptedPW,
    },
  };

  try {
    await dynamoDB.update(updateParams).promise();

    await dynamoDB.delete(tokenParams).promise();

    return utils.buildResponse(200, {
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.resetPassword = resetPassword;
