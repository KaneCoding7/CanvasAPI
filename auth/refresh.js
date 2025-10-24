const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("./utils/buildResponse");
const { generateAccessToken } = require("./auth");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const refreshTokenTable = "CanvasRefreshTokens";
const userTable = "CanvasUsers";

async function refresh(requestBody) {
  const { refreshToken } = requestBody;
  if (!refreshToken) {
    return utils.buildResponse(401, {
      message: "Refresh token is required",
    });
  }

  const storedToken = await getRefreshToken(refreshToken);
  if (!storedToken) {
    return utils.buildResponse(401, {
      message: "Invalid refresh token",
    });
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (storedToken.expiresAt < nowInSeconds) {
    await deleteRefreshToken(refreshToken);
    return utils.buildResponse(401, {
      message: "Refresh token expired",
    });
  }

  const user = await getUser(storedToken.userId);
  if (!user) {
    return utils.buildResponse(401, {
      message: "User not found for this token",
    });
  }

  const userInfo = {
    project: "canvas",
    username: user.username,
    name: user.name,
  };

  const newAccessToken = generateAccessToken(userInfo);

  return utils.buildResponse(200, {
    accessToken: newAccessToken,
  });
}

async function getRefreshToken(token) {
  const params = {
    TableName: refreshTokenTable,
    Key: {
      token: token,
    },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => {
        console.error("Error getting refresh token:", error);
        return null;
      }
    );
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
      (response) => response.Item,
      (error) => {
        console.error("Error getting user:", error);
        return null;
      }
    );
}

async function deleteRefreshToken(token) {
  const params = {
    TableName: refreshTokenTable,
    Key: {
      token: token,
    },
  };
  return await dynamoDB.delete(params).promise();
}

module.exports.refresh = refresh;
