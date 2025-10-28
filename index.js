const { refresh } = require("./auth/refresh");
const { login } = require("./auth/login");
const { register } = require("./auth/register");
const { verify } = require("./auth/verify");
const utils = require("./utils/buildResponse");
const { authenticate } = require("./utils/authenticate");
const { createAccount } = require("./account/createAccount");
const { getAccount } = require("./account/getAccount");

const healthPath = "/health";
const loginPath = "/auth/login";
const registerPath = "/auth/register";
const verifyPath = "/auth/verify";
const refreshPath = "/auth/refresh";
const accountPath = "/account";
const userAccountPath = "/account/{username}";

exports.handler = async (event) => {
  console.log("Requested Event:", event);

  let body = null;
  if (event.body) {
    body = JSON.parse(event.body);
  }

  // Unauthorized Routes
  switch (true) {
    case evaluatePath(event, "GET", healthPath):
      return utils.buildResponse(200);

    case evaluatePath(event, "POST", loginPath):
      return await login(body);

    case evaluatePath(event, "POST", registerPath):
      return await register(body);

    case evaluatePath(event, "POST", verifyPath):
      return await verify(body);

    case evaluatePath(event, "POST", refreshPath):
      return await refresh(body);
  }

  const authResult = authenticate(event);

  if (!authResult.verified) {
    return utils.buildResponse(authResult.statusCode, {
      message: authResult.message,
    });
  }
  const loggedInUser = authResult.payload;

  const requestedUsername = event.pathParameters?.username;

  // Authorized Routes
  switch (true) {
    // Account Routes
    case evaluatePath(event, "POST", accountPath):
      return await createAccount(loggedInUser, body);

    case evaluatePath(event, "GET", userAccountPath):
      return await getAccount(requestedUsername, loggedInUser);
  }

  return utils.buildResponse(404, "Not Found");
};

function evaluatePath(event, method, path) {
  return (
    (event.resource === path || event.path === path) &&
    event.httpMethod === method
  );
}
