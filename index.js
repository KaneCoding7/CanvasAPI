const { refresh } = require("./auth/refresh");
const { login } = require("./auth/login");
const { register } = require("./auth/register");
const { verify } = require("./auth/verify");
const utils = require("./utils/buildResponse");
const { authenticate } = require("./utils/authenticate");
const { createAccount } = require("./account/createAccount");
const { getAccount } = require("./account/getAccount");
const { updateAccount } = require("./account/updateAccount");
const { deleteAccount } = require("./account/deleteAccount");
const { createBoxerProfile } = require("./boxerProfile/createBoxerProfile");
const { getBoxerProfile } = require("./boxerProfile/getBoxerProfile");
const { updateBoxerProfile } = require("./boxerProfile/updateBoxerProfile");
const { deleteBoxerProfile } = require("./boxerProfile/deleteBoxerProfile");
const { createCoachProfile } = require("./coachProfile/createCoachProfile");
const { getCoachProfile } = require("./coachProfile/getCoachProfile");
const { updateCoachProfile } = require("./coachProfile/updateCoachProfile");
const { deleteCoachProfile } = require("./coachProfile/deleteCoachProfile");
const { createGym } = require("./gym/createGym");
const { getGym } = require("./gym/getGym");
const { updateGym } = require("./gym/updateGym");
const { deleteGym } = require("./gym/deleteGym");
const { getAllGyms } = require("./gym/getAllGyms");
const { createEvent } = require("./event/createEvent");
const { getAllEvents } = require("./event/getAllEvents");
const { getEvent } = require("./event/getEvent");
const { updateEvent } = require("./event/updateEvent");
const { deleteEvent } = require("./event/deleteEvent");
const { createBout } = require("./bout/createBout");
const { getBout } = require("./bout/getBout");
const { updateBout } = require("./bout/updateBout");
const { deleteBout } = require("./bout/deleteBout");
const { createRefProfile } = require("./refProfile/createRefProfile");
const { getRefProfile } = require("./refProfile/getRefProfile");
const { updateRefProfile } = require("./refProfile/updateRefProfile");
const { deleteRefProfile } = require("./refProfile/deleteRefProfile");

const healthPath = "/health";
const loginPath = "/auth/login";
const registerPath = "/auth/register";
const verifyPath = "/auth/verify";
const refreshPath = "/auth/refresh";
const accountPath = "/account";
const userAccountPath = "/account/{username}";
const boxerProfile = "/boxerProfile";
const userBoxerProfile = "/boxerProfile/{username}";
const coachProfilePath = "/coachProfile";
const userCoachProfilePath = "/coachProfile/{username}";
const gymPath = "/gym";
const idGymPath = "/gym/{gymId}";
const eventPath = "/event";
const idEventPath = "/event/{eventId}";
const boutPath = "/bout";
const idBoutPath = "/bout/{boutId}";
const refProfilePath = "/refProfile";
const idRefProfilePath = "/refProfile/{username}";

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

    case evaluatePath(event, "PATCH", userAccountPath):
      return await updateAccount(requestedUsername, body, loggedInUser);

    case evaluatePath(event, "DELETE", userAccountPath):
      return await deleteAccount(requestedUsername, loggedInUser);

    // Boxer Profile Routes
    case evaluatePath(event, "POST", boxerProfile):
      return await createBoxerProfile(loggedInUser, body);

    case evaluatePath(event, "GET", userBoxerProfile):
      return await getBoxerProfile(requestedUsername, loggedInUser);

    case evaluatePath(event, "PATCH", userBoxerProfile):
      return await updateBoxerProfile(requestedUsername, loggedInUser, body);

    case evaluatePath(event, "DELETE", userBoxerProfile):
      return await deleteBoxerProfile(requestedUsername, loggedInUser);

    // Boxer Profile Routes
    case evaluatePath(event, "POST", coachProfilePath):
      return await createCoachProfile(body, loggedInUser);

    case evaluatePath(event, "GET", userCoachProfilePath):
      return await getCoachProfile(requestedUsername, loggedInUser);

    case evaluatePath(event, "PATCH", userCoachProfilePath):
      return await updateCoachProfile(requestedUsername, loggedInUser, body);

    case evaluatePath(event, "DELETE", userCoachProfilePath):
      return await deleteCoachProfile(requestedUsername, loggedInUser);

    // Gym Routes
    case evaluatePath(event, "POST", gymPath):
      return await createGym(loggedInUser, body);

    case evaluatePath(event, "GET", gymPath):
      return await getAllGyms();

    case evaluatePath(event, "GET", idGymPath):
      return await getGym(event.pathParameters?.gymId);

    case evaluatePath(event, "PATCH", idGymPath):
      return await updateGym(event.pathParameters?.gymId, body, loggedInUser);

    case evaluatePath(event, "DELETE", idGymPath):
      return await deleteGym(event.pathParameters?.gymId, loggedInUser);

    // Event Routes
    case evaluatePath(event, "POST", eventPath):
      return await createEvent(loggedInUser, body);

    case evaluatePath(event, "GET", eventPath):
      return await getAllEvents();

    case evaluatePath(event, "GET", idEventPath):
      return await getEvent(event.pathParameters?.eventId);

    case evaluatePath(event, "PATCH", idEventPath):
      return await updateEvent(
        event.pathParameters?.eventId,
        body,
        loggedInUser
      );

    case evaluatePath(event, "DELETE", idEventPath):
      return await deleteEvent(event.pathParameters?.eventId, loggedInUser);

    // Bout Routes
    case evaluatePath(event, "POST", boutPath):
      return await createBout(loggedInUser, body);

    case evaluatePath(event, "GET", idBoutPath):
      return await getBout(event.pathParameters?.boutId);

    case evaluatePath(event, "PATCH", idBoutPath):
      return await updateBout(event.pathParameters?.boutId, body, loggedInUser);

    case evaluatePath(event, "DELETE", idBoutPath):
      return await deleteBout(event.pathParameters?.boutId, loggedInUser);

    // Ref Profile Routes
    case evaluatePath(event, "POST", refProfilePath):
      return await createRefProfile(loggedInUser, body);

    case evaluatePath(event, "GET", idRefProfilePath):
      return await getRefProfile(requestedUsername, loggedInUser);

    case evaluatePath(event, "PATCH", idRefProfilePath):
      return await updateRefProfile(requestedUsername, body, loggedInUser);

    case evaluatePath(event, "DELETE", idRefProfilePath):
      return await deleteRefProfile(requestedUsername, loggedInUser);
  }

  return utils.buildResponse(404, "Not Found");
};

function evaluatePath(event, method, path) {
  return (
    (event.resource === path || event.path === path) &&
    event.httpMethod === method
  );
}
