const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const BoxerProfile = require("./boxerProfile");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const boxerProfileTable = "CanvasBoxerProfiles";

async function createBoxerProfile(loggedInUser, body) {
  const username = loggedInUser.username;

  const existingProfile = await getBoxerProfile(username);
  if (existingProfile) {
    return utils.buildResponse(409, {
      message: "A boxer profile already exists for this user.",
    });
  }

  const { weightClass, usaBoxingNumber } = body;
  if (!weightClass || !usaBoxingNumber) {
    return utils.buildResponse(400, {
      message: "weightClass and usaBoxingNumber are required.",
    });
  }

  const newProfile = new BoxerProfile(loggedInUser, body);

  const saved = await saveBoxerProfile(newProfile);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating boxer profile. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Boxer profile created successfully",
    profile: newProfile,
  });
}

async function getBoxerProfile(username) {
  const params = {
    TableName: boxerProfileTable,
    Key: { username: username },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => {
        console.error("Error in getBoxerProfile:", error);
        return null;
      }
    );
}

async function saveBoxerProfile(profileItem) {
  const params = {
    TableName: boxerProfileTable,
    Item: profileItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveBoxerProfile:", error);
        return false;
      }
    );
}

module.exports.createBoxerProfile = createBoxerProfile;
