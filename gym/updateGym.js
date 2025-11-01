const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const gymTable = "CanvasGyms";

async function updateGym(gymId, body, loggedInUser) {
  const gym = await getGymById(gymId);

  if (!gym) {
    return utils.buildResponse(404, { message: "Gym not found." });
  }

  if (gym.ownerUsername !== loggedInUser.username) {
    return utils.buildResponse(403, {
      message: "Forbidden: You are not the owner of this gym.",
    });
  }

  const { name, address, phone, email } = body;

  const params = {
    TableName: gymTable,
    Key: { gymId: gymId },
    UpdateExpression: "SET #ua = :ua",
    ExpressionAttributeNames: {
      "#ua": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":ua": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  if (name !== undefined) {
    params.UpdateExpression += ", #n = :n";
    params.ExpressionAttributeNames["#n"] = "name";
    params.ExpressionAttributeValues[":n"] = name;
  }

  if (address !== undefined) {
    params.UpdateExpression += ", #a = :a";
    params.ExpressionAttributeNames["#a"] = "address";
    params.ExpressionAttributeValues[":a"] = address;
  }

  if (phone !== undefined) {
    params.UpdateExpression += ", #p = :p";
    params.ExpressionAttributeNames["#p"] = "phone";
    params.ExpressionAttributeValues[":p"] = phone;
  }

  if (email !== undefined) {
    params.UpdateExpression += ", #e = :e";
    params.ExpressionAttributeNames["#e"] = "email";
    params.ExpressionAttributeValues[":e"] = email;
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
    console.error("Error in updateGym:", error);
    return utils.buildResponse(500, { message: "Server error." });
  }
}

async function getGymById(gymId) {
  const params = {
    TableName: gymTable,
    Key: { gymId: gymId },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => null
    );
}

module.exports.updateGym = updateGym;
