const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const Bout = require("./bout");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boutTable = "CanvasBouts";

async function createBout(loggedInUser, body) {
  const {
    eventId,
    fighter1Username,
    fighter2Username,
    weightClass,
    boutNumber,
    rounds,
  } = body;

  if (
    !eventId ||
    !fighter1Username ||
    !fighter2Username ||
    !weightClass ||
    !boutNumber ||
    !rounds
  ) {
    return utils.buildResponse(400, {
      message:
        "eventId, fighter1Username, fighter2Username, weightClass, boutNumber, and rounds are required.",
    });
  }

  const newBout = new Bout(loggedInUser, body);

  const saved = await saveBout(newBout);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating bout. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Bout created successfully",
    bout: newBout,
  });
}

async function saveBout(boutItem) {
  const params = {
    TableName: boutTable,
    Item: boutItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveBout:", error);
        return false;
      }
    );
}

module.exports.createBout = createBout;
