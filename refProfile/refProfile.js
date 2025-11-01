class RefProfile {
  constructor(loggedInUser, body) {
    this.username = loggedInUser.username;

    this.licenseNumber = body.licenseNumber;
    this.organization = body.organization;

    this.level = body.level || null; // e.g., "Amateur", "Pro"
    this.region = body.region || null; // e.g., "State", "National"

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = RefProfile;
