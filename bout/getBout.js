const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boutTable = "CanvasBouts";

async function getBout(boutId) {
  if (!boutId) {
    return utils.buildResponse(400, {
      message: "boutId missing from URL path",
    });
  }

  try {
    const params = {
      TableName: boutTable,
      Key: { boutId: boutId },
    };

    const response = await dynamoDB.get(params).promise();

    if (!response.Item) {
      return utils.buildResponse(404, { message: "Bout not found." });
    }

    return utils.buildResponse(200, response.Item);
  } catch (error) {
    console.error("Error in getBout:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.getBout = getBout;
