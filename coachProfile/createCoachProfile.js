const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const CoachProfile = require("./coachProfile");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const coachProfileTable = "CanvasCoachProfiles";

async function createCoachProfile(body, loggedInUser) {
  const username = loggedInUser.username;

  const existingProfile = await getCoachProfile(username);
  if (existingProfile) {
    return utils.buildResponse(409, {
      message: "A coach profile already exists for this user.",
    });
  }

  const { gymId, certificationNumber } = body;
  if (!gymId || !certificationNumber) {
    return utils.buildResponse(400, {
      message: "gymId and certificationNumber are required.",
    });
  }

  const newProfile = new CoachProfile(loggedInUser, body);

  const saved = await saveCoachProfile(newProfile);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating coach profile. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Coach profile created successfully",
    profile: newProfile,
  });
}

async function getCoachProfile(username) {
  const params = {
    TableName: coachProfileTable,
    Key: { username: username },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => {
        console.error("Error in getCoachProfile:", error);
        return null;
      }
    );
}

async function saveCoachProfile(profileItem) {
  const params = {
    TableName: coachProfileTable,
    Item: profileItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveCoachProfile:", error);
        return false;
      }
    );
}

module.exports.createCoachProfile = createCoachProfile;
