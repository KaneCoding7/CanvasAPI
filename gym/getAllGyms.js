const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const gymTable = "CanvasGyms";

async function getAllGyms() {
  try {
    const params = {
      TableName: gymTable,
    };

    const response = await dynamoDB.scan(params).promise();

    return utils.buildResponse(200, response.Items || []);
  } catch (error) {
    console.error("Error in getAllGyms:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

module.exports.getAllGyms = getAllGyms;
