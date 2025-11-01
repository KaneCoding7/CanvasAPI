const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const RefProfile = require("./refProfile");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const refProfileTable = "CanvasRefProfiles";

async function createRefProfile(loggedInUser, body) {
  const username = loggedInUser.username;

  const existingProfile = await getRefProfile(username);
  if (existingProfile) {
    return utils.buildResponse(409, {
      message: "A referee profile already exists for this user.",
    });
  }

  const { licenseNumber, organization } = body;
  if (!licenseNumber || !organization) {
    return utils.buildResponse(400, {
      message: "licenseNumber and organization are required.",
    });
  }

  const newProfile = new RefProfile(loggedInUser, body);

  const saved = await saveRefProfile(newProfile);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating referee profile. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Referee profile created successfully",
    profile: newProfile,
  });
}

async function getRefProfile(username) {
  const params = {
    TableName: refProfileTable,
    Key: { username: username },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => {
        console.error("Error in getRefProfile:", error);
        return null;
      }
    );
}

async function saveRefProfile(profileItem) {
  const params = {
    TableName: refProfileTable,
    Item: profileItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveRefProfile:", error);
        return false;
      }
    );
}

module.exports.createRefProfile = createRefProfile;
