const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const userTable = "CanvasUsers";

async function checkUsername(body) {
  const { username } = body;
  if (!username) {
    return utils.buildResponse(400, {
      message: "Username is required.",
    });
  }

  const existingUser = await getUser(username);

  if (!existingUser) {
    return utils.buildResponse(200, {
      valid: true,
      message: "Username is available.",
    });
  }

  const suggestionsToTry = [
    `${username}${Math.floor(Math.random() * 90 + 10)}`,
    `${username}${Math.floor(Math.random() * 90 + 10)}`,
    `the_${username}`,
  ];

  const checks = suggestionsToTry.map((uname) => getUser(uname));
  const results = await Promise.all(checks);

  const availableSuggestions = [];
  results.forEach((user, index) => {
    if (!user) {
      availableSuggestions.push(suggestionsToTry[index]);
    }
  });

  return utils.buildResponse(200, {
    valid: false,
    message: "Username is already taken.",
    suggestions: availableSuggestions,
  });
}

async function getUser(username) {
  const params = {
    TableName: userTable,
    Key: {
      username: username,
    },
  };

  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("Error in getUser:", error);
        return null;
      }
    );
}

module.exports.checkUsername = checkUsername;
