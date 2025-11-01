const { randomUUID } = require("crypto");

class Event {
  constructor(loggedInUser, body) {
    this.eventId = randomUUID();

    this.ownerUsername = loggedInUser.username;

    this.name = body.name;
    this.date = body.date;
    this.venue = body.venue;

    this.promoterUsername = body.promoterUsername || null;
    this.gymId = body.gymId || null;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Event;
