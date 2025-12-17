class BoxerProfile {
  constructor(loggedInUser, body) {
    this.username = loggedInUser.username;

    this.weightClass = body.weightClass;
    this.usaBoxingNumber = body.usaBoxingNumber;
    this.wins = body.wins || 0;
    this.losses = body.losses || 0;
    this.draws = body.draws || 0;
    this.gymId = body.gymId || null;

    this.age = body.age;
    this.state = body.state;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = BoxerProfile;
