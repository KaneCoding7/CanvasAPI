const { randomUUID } = require("crypto");

class Bout {
  constructor(loggedInUser, body) {
    this.boutId = randomUUID();

    this.ownerUsername = loggedInUser.username;

    this.eventId = body.eventId;
    this.fighter1Username = body.fighter1Username;
    this.fighter2Username = body.fighter2Username;
    this.weightClass = body.weightClass;
    this.boutNumber = body.boutNumber;
    this.rounds = body.rounds;

    this.refUsername = body.refUsername || null;

    this.status = "SCHEDULED"; // Other statuses: COMPLETED, CANCELLED
    this.result = null; // e.g., "fighter1Username", "draw"
    this.resultDetails = null; // e.g., "KO, Round 2, 1:15"

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Bout;
