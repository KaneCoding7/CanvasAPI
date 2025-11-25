const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const utils = require("../utils/buildResponse");
const { randomUUID } = require("crypto");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

const userTable = "CanvasUsers";
const resetTokenTable = "CanvasPasswordResetTokens";
const SENDER_EMAIL = "marcus.kane@chanesoftwaresolutions.com";
const FRONTEND_URL = "http://localhost:3000/Login";
const LOGO_URL = "https://chanesoftwaresolutions.com/Images/CLogo.png";

async function requestPasswordReset(body) {
  const { username } = body;
  if (!username) {
    return utils.buildResponse(400, { message: "Username is required." });
  }

  const user = await getUser(username);
  if (!user) {
    return utils.buildResponse(200, {
      message: "If that user exists, a reset link has been sent.",
    });
  }

  const resetToken = randomUUID();

  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
  const tokenItem = {
    token: resetToken,
    username: username,
    expiresAt: expiresAt,
  };

  await saveToken(tokenItem);

  try {
    await sendResetEmail(user.email, resetToken);
  } catch (error) {
    console.error("SES Error:", error);
    return utils.buildResponse(500, { message: "Error sending email." });
  }

  return utils.buildResponse(200, {
    message: "If that user exists, a reset link has been sent.",
  });
}

async function getUser(username) {
  const params = { TableName: userTable, Key: { username: username } };
  return await dynamoDB
    .get(params)
    .promise()
    .then((res) => res.Item);
}

async function saveToken(item) {
  const params = { TableName: resetTokenTable, Item: item };
  return await dynamoDB.put(params).promise();
}

async function sendResetEmail(userEmail, token) {
  const resetLink = `${FRONTEND_URL}?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Basic styling for email clients */
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; height: auto; }
        .content { text-align: center; color: #333333; }
        .title { color: #18497c; font-size: 28px; font-weight: bold; margin-bottom: 10px; } /* Red color for boxing theme */
        .text { font-size: 16px; line-height: 1.5; margin-bottom: 25px; }
        .button { display: inline-block; background-color: #18497c; color: #ffffff !important; padding: 12px 24px; font-size: 18px; font-weight: bold; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 30px; font-size: 12px; color: #888888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="Canvas Boxing Logo" class="logo">
        </div>
        <div class="content">
          <h1 class="title">Reset Password</h1>
          <p class="text">You requested a password reset. Click the button below to choose a new password.</p>
          
          <a href="${resetLink}" class="button">Reset My Password</a>
          <p style="font-size: 12px; color: #999;">This link expires in 15 minutes.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Canvas Boxing App</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const params = {
    Source: SENDER_EMAIL,
    Destination: { ToAddresses: [userEmail] },
    Message: {
      Subject: { Data: "Action Required: Reset Your Password" },
      Body: {
        Html: {
          Data: htmlContent,
        },
        Text: {
          Data: `Reset your password here: ${resetLink}`,
        },
      },
    },
  };

  return await ses.sendEmail(params).promise();
}

module.exports.requestPasswordReset = requestPasswordReset;
