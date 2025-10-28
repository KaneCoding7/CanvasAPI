const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const bcrypt = require("bcryptjs");
const { login } = require("./login");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
let userTable = "CanvasUsers";

async function register(userInfo) {
  const name = userInfo.name;
  const email = userInfo.email;
  const username = userInfo.username;
  const password = userInfo.password;

  if (!username || !password || !email || !password || !name || !userTable) {
    return utils.buildResponse(401, {
      message: "All fields are required",
    });
  }

  const dynamoUser = await getUser(username);
  if (dynamoUser && dynamoUser.username) {
    return utils.buildResponse(401, {
      message: "Username already exists. Please choose another one.",
    });
  }

  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const user = {
    name: name,
    email: email,
    username: username.toLowerCase().trim(),
    password: encryptedPW,
  };

  const savedUserResponse = await saveUser(user);
  if (!savedUserResponse) {
    return utils.buildResponse(503, {
      message: "Server Error. Please try again later.",
    });
  }

  const loginRequest = {
    username: user.username,
    password: userInfo.password,
    table: userTable,
  };

  return await login(loginRequest);
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
        console.error("There is an error getting the user:", error);
      }
    );
}

async function saveUser(user) {
  const params = {
    TableName: userTable,
    Item: user,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => {
        return true;
      },
      (error) => {
        console.error("There is an error saving the user:", error);
      }
    );
}

module.exports.register = register;
