const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const accountTable = "CanvasAccounts";
const userTable = "CanvasUsers";
const refreshTokenTable = "CanvasRefreshTokens";

const refreshTokenGSI = "userId-index";

async function deleteAccount(requestedUsername, loggedInUser) {
  if (loggedInUser.username !== requestedUsername) {
    return utils.buildResponse(403, {
      message: "Forbidden: You cannot delete another user's account.",
    });
  }

  try {
    const queryParams = {
      TableName: refreshTokenTable,
      IndexName: refreshTokenGSI,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": requestedUsername,
      },
    };

    const tokenData = await dynamoDB.query(queryParams).promise();

    if (tokenData.Items && tokenData.Items.length > 0) {
      const deleteRequests = tokenData.Items.map((item) => {
        return {
          DeleteRequest: {
            Key: {
              token: item.token,
            },
          },
        };
      });

      const batchDeleteParams = {
        RequestItems: {
          [refreshTokenTable]: deleteRequests,
        },
      };
      await dynamoDB.batchWrite(batchDeleteParams).promise();
    }

    const userParams = {
      TableName: userTable,
      Key: { username: requestedUsername },
    };
    await dynamoDB.delete(userParams).promise();

    const accountParams = {
      TableName: accountTable,
      Key: { username: requestedUsername },
    };
    await dynamoDB.delete(accountParams).promise();

    return utils.buildResponse(200, {
      message: "User deleted successfully from all services.",
    });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.deleteAccount = deleteAccount;
