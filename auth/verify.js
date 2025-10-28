const utils = require("../utils/buildResponse");
const { verifyAccessToken } = require("./auth");

function verify(requestBody) {
  if (!requestBody.user || !requestBody.user.username || !requestBody.token) {
    return utils.buildResponse(401, {
      verified: false,
      message: "incorrect request body",
    });
  }

  const user = requestBody.user;
  const token = requestBody.token;
  const username = requestBody.user.username;
  const verification = verifyAccessToken(token);

  if (!verification.verified) {
    return utils.buildResponse(401, {
      verified: false,
      message: verification.message,
    });
  }

  if (verification.payload.username !== username) {
    return utils.buildResponse(401, {
      verified: false,
      message: "Token does not match user.",
    });
  }

  return utils.buildResponse(200, {
    verified: true,
    message: "success",
    user: user,
    token: token,
  });
}

module.exports.verify = verify;
