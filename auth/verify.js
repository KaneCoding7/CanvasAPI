const utils = require("./utils/buildResponse");
const auth = require("./auth");

function verify(requestBody) {
  if (!requestBody.user || !requestBody.user.username || !requestBody.token) {
    return util.buildResponse(401, {
      varified: false,
      message: "incorrect request body",
    });
  }

  const user = requestBody.user;
  const token = requestBody.token;
  const verification = auth.verifyToken(user.username, token);
  if (!verification.verified) {
    return util.buildResponse(401, {
      verified: verification,
    });
  }
  return util.buildResponse(200, {
    verified: true,
    message: "success",
    user: user,
    token: token,
  });
}

module.exports.verify = verify;
