const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boutTable = "CanvasBouts";

async function deleteBout(boutId, loggedInUser) {
  const bout = await getBoutById(boutId);

  if (!bout) {
    return utils.buildResponse(404, { message: "Bout not found." });
  }

  if (bout.ownerUsername !== loggedInUser.username) {
    return utils.buildResponse(403, {
      message:
        "Forbidden: You are not the owner of this bout and cannot delete it.",
    });
  }

  const params = {
    TableName: boutTable,
    Key: { boutId: boutId },
  };

  try {
    await dynamoDB.delete(params).promise();
    return utils.buildResponse(200, {
      message: "Bout deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteBout:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

async function getBoutById(boutId) {
  const params = {
    TableName: boutTable,
    Key: { boutId: boutId },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => null
    );
}

module.exports.deleteBout = deleteBout;
