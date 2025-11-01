const { randomUUID } = require("crypto");

class Gym {
  constructor(loggedInUser, body) {
    this.gymId = randomUUID();
    this.ownerUsername = loggedInUser.username;
    this.name = body.name;
    this.address = body.address || null;
    this.phone = body.phone || null;
    this.email = body.email || null;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Gym;
