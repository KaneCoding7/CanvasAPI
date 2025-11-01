const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boutTable = "CanvasBouts";

async function updateBout(boutId, body, loggedInUser) {
  const bout = await getBoutById(boutId);

  if (!bout) {
    return utils.buildResponse(404, { message: "Bout not found." });
  }

  if (bout.ownerUsername !== loggedInUser.username) {
    return utils.buildResponse(403, {
      message: "Forbidden: You are not the owner of this bout.",
    });
  }

  const {
    fighter1Username,
    fighter2Username,
    weightClass,
    boutNumber,
    rounds,
    refUsername,
    status,
    result,
    resultDetails,
  } = body;

  const params = {
    TableName: boutTable,
    Key: { boutId: boutId },
    UpdateExpression: "SET #ua = :ua",
    ExpressionAttributeNames: {
      "#ua": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":ua": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  if (fighter1Username !== undefined) {
    params.UpdateExpression += ", #f1u = :f1u";
    params.ExpressionAttributeNames["#f1u"] = "fighter1Username";
    params.ExpressionAttributeValues[":f1u"] = fighter1Username;
  }

  if (fighter2Username !== undefined) {
    params.UpdateExpression += ", #f2u = :f2u";
    params.ExpressionAttributeNames["#f2u"] = "fighter2Username";
    params.ExpressionAttributeValues[":f2u"] = fighter2Username;
  }

  if (weightClass !== undefined) {
    params.UpdateExpression += ", #wc = :wc";
    params.ExpressionAttributeNames["#wc"] = "weightClass";
    params.ExpressionAttributeValues[":wc"] = weightClass;
  }

  if (boutNumber !== undefined) {
    params.UpdateExpression += ", #bn = :bn";
    params.ExpressionAttributeNames["#bn"] = "boutNumber";
    params.ExpressionAttributeValues[":bn"] = boutNumber;
  }

  if (rounds !== undefined) {
    params.UpdateExpression += ", #r = :r";
    params.ExpressionAttributeNames["#r"] = "rounds";
    params.ExpressionAttributeValues[":r"] = rounds;
  }

  if (refUsername !== undefined) {
    params.UpdateExpression += ", #ru = :ru";
    params.ExpressionAttributeNames["#ru"] = "refUsername";
    params.ExpressionAttributeValues[":ru"] = refUsername;
  }

  if (status !== undefined) {
    params.UpdateExpression += ", #s = :s";
    params.ExpressionAttributeNames["#s"] = "status";
    params.ExpressionAttributeValues[":s"] = status;
  }

  if (result !== undefined) {
    params.UpdateExpression += ", #res = :res";
    params.ExpressionAttributeNames["#res"] = "result";
    params.ExpressionAttributeValues[":res"] = result;
  }

  if (resultDetails !== undefined) {
    params.UpdateExpression += ", #rd = :rd";
    params.ExpressionAttributeNames["#rd"] = "resultDetails";
    params.ExpressionAttributeValues[":rd"] = resultDetails;
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
    console.error("Error in updateBout:", error);
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

module.exports.updateBout = updateBout;
