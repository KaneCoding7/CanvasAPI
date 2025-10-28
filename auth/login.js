const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("./auth");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const refreshTokenTable = "CanvasRefreshTokens";
let userTable = "CanvasUsers";

async function login(user) {
  const username = user.username;
  const password = user.password;

  if (!user || !username || !password || !userTable) {
    return utils.buildResponse(401, {
      message: "Username and password are required",
    });
  }

  const dynamoUser = await getUser(username);
  if (!dynamoUser || !dynamoUser.username) {
    return utils.buildResponse(403, {
      message: "User does not exist",
    });
  }

  if (
    dynamoUser.hasOwnProperty("authorized") &&
    dynamoUser.authorized !== true
  ) {
    return utils.buildResponse(403, {
      message: "User is not authorized to login.",
    });
  }

  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return utils.buildResponse(403, {
      message: "Password is incorrect",
    });
  }

  const userInfo = {
    project: "canvas",
    username: dynamoUser.username,
    name: dynamoUser.name,
  };

  const accessToken = generateAccessToken(userInfo);
  const refreshToken = generateRefreshToken();
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  const refreshTokenParams = {
    TableName: refreshTokenTable,
    Item: {
      token: refreshToken,
      userId: dynamoUser.username,
      expiresAt: expiresAt,
    },
  };

  try {
    await dynamoDB.put(refreshTokenParams).promise();
  } catch (dbError) {
    console.error("Error saving refresh token:", dbError);
    return utils.buildResponse(500, {
      message: "Internal server error during login",
    });
  }

  const response = {
    user: userInfo,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };

  return utils.buildResponse(200, response);
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
        console.error("Error getting user:", error);
        return null;
      }
    );
}

module.exports.login = login;
