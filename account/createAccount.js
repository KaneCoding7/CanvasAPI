const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const Account = require("./account");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const accountTable = "CanvasAccounts";

async function createAccount(loggedInUser, body) {
  const username = loggedInUser.username;

  const existingAccount = await getAccount(username);
  if (existingAccount) {
    return utils.buildResponse(409, {
      message: "An account already exists for this user.",
    });
  }

  const { firstName, lastName, email } = body;

  if (!firstName || !lastName || !email) {
    return utils.buildResponse(400, {
      message: "firstName, lastName, and email are required in the body.",
    });
  }

  const newAccount = new Account(loggedInUser, body);

  const saved = await saveAccount(newAccount);
  if (!saved) {
    return utils.buildResponse(500, {
      message: "Server error creating account. Please try again.",
    });
  }

  return utils.buildResponse(201, {
    message: "Account created successfully",
    account: newAccount,
  });
}

async function getAccount(username) {
  const params = {
    TableName: accountTable,
    Key: { username: username },
  };
  return await dynamoDB
    .get(params)
    .promise()
    .then(
      (response) => response.Item,
      (error) => {
        console.error("Error in getAccount:", error);
        return null;
      }
    );
}

async function saveAccount(accountItem) {
  const params = {
    TableName: accountTable,
    Item: accountItem,
  };
  return await dynamoDB
    .put(params)
    .promise()
    .then(
      () => true,
      (error) => {
        console.error("Error in saveAccount:", error);
        return false;
      }
    );
}

module.exports.createAccount = createAccount;
