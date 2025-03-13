const User = require("../models/user");
const bcrypt = require("bcryptjs");

class UserService {
  async registerUser(username, password, role) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    return user;
  }

  async findUserByUsername(username) {
    return await User.findOne({ username });
  }

  async findUserByRefreshToken(refreshToken) {
    return await User.findOne({ refreshToken });
  }

  async updateRefreshToken(userId, refreshToken) {
    await User.findByIdAndUpdate(userId, { refreshToken });
  }
}

module.exports = new UserService();
