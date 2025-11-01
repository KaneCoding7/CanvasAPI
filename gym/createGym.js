const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const Gym = require("./gym");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const gymTable = "CanvasGyms";

async function createGym(loggedInUser, body) {
  const { name } = body;
  if (!name) {
    return utils.buildResponse(400, {
      message: "A 'name' is required for the gym.",
    });
  }

  const newGym = new Gym(loggedInUser, body);

  const saved = await saveGym(newGym);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating gym. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Gym created successfully",
    gym: newGym,
  });
}

async function saveGym(gymItem) {
  const params = {
    TableName: gymTable,
    Item: gymItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveGym:", error);
        return false;
      }
    );
}

module.exports.createGym = createGym;
