const { refresh } = require("./auth/refresh");
const { login } = require("./auth/login");
const { register } = require("./auth/register");
const { verify } = require("./auth/verify");
const utils = require("./utils/buildResponse");

const healthPath = "/health";
const loginPath = "/auth/login";
const registerPath = "/auth/register";
const verifyPath = "/auth/verify";
const refreshPath = "/auth/refresh";

exports.handler = async (event) => {
  console.log("Requested Event:", event);

  const body = JSON.parse(event.body);

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

  return buildResponse(404, "Not Found");
};

function evaluatePath(event, medthod, path) {
  return event.path === path && event.httpMethod === medthod;
}
