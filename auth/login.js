const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("./utils/buildResponse");
const bcrypt = require("bcryptjs");
const auth = require("./auth");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const userTable = "ChaneUsers";
let userTable;

async function login(user) {
  const username = user.username;
  const password = user.password;
  userTable = user.table;

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
    username: dynamoUser.username,
    name: dynamoUser.name,
  };

  const token = auth.generateToken(userInfo);
  const response = {
    user: userInfo,
    token: token,
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
