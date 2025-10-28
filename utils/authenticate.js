const { verifyAccessToken } = require("../auth/auth");

function authenticate(event) {
  const authHeader =
    event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader) {
    return {
      verified: false,
      message: "Authorization header missing",
      statusCode: 401,
    };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return {
      verified: false,
      message: "Bearer token missing from header",
      statusCode: 401,
    };
  }

  const verification = verifyAccessToken(token);

  if (!verification.verified) {
    return {
      verified: false,
      message: verification.message,
      statusCode: 401,
    };
  }
  return {
    verified: true,
    payload: verification.payload,
  };
}

module.exports.authenticate = authenticate;
