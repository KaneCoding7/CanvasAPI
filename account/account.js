class Account {
  constructor(loggedInUser, body) {
    this.username = loggedInUser.username;
    this.firstName = body.firstName;
    this.lastName = body.lastName;
    this.email = body.email;
    this.phone = body.phone || null;
    this.bio = body.bio || null;
    this.profilePicUrl = body.profilePicUrl || null;

    this.followersCount = 0;
    this.followingCount = 0;
    this.postsCount = 0;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Account;
