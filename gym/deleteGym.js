const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const gymTable = "CanvasGyms";

async function deleteGym(gymId, loggedInUser) {
  const gym = await getGymById(gymId);

  if (!gym) {
    return utils.buildResponse(404, { message: "Gym not found." });
  }

  if (gym.ownerUsername !== loggedInUser.username) {
    return utils.buildResponse(403, {
      message:
        "Forbidden: You are not the owner of this gym and cannot delete it.",
    });
  }

  const params = {
    TableName: gymTable,
    Key: { gymId: gymId },
  };

  try {
    await dynamoDB.delete(params).promise();
    return utils.buildResponse(200, {
      message: "Gym deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteGym:", error);
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

module.exports.deleteGym = deleteGym;
