const utils = require("./utils/buildResponse");

const healthPath = "/health";
const loginPath = "/auth/login";
const registerPath = "/auth/register";
const verifyPath = "/auth/verify";

exports.handler = async (event) => {
  console.log("Requested Event:", event);

  const body = JSON.parse(event.body);

  switch (true) {
    case evaluatePath(event, "GET", healthPath):
      return utils.buildResponse(200);

    case evaluatePath(event, "POST", loginPath):
      return await loginService.login(body);

    case evaluatePath(event, "POST", registerPath):
      return await registerService.register(body);

    case evaluatePath(event, "POST", verifyPath):
      return await verifyService.verify(body);
  }

  return buildResponse(404, "Not Found");
};

function evaluatePath(event, medthod, path) {
  return event.path === path && event.httpMethod === medthod;
}
