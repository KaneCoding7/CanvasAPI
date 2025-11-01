class CoachProfile {
  constructor(loggedInUser, body) {
    this.username = loggedInUser.username;
    this.gymId = body.gymId;
    this.certificationNumber = body.certificationNumber;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = CoachProfile;
