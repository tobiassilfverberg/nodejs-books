/**
 * User model
 */
const bcrypt = require("bcrypt");

module.exports = (bookshelf) => {
  return bookshelf.model(
    "User",
    {
      tableName: "users",
      books() {
        return this.belongsToMany("Book");
      },
    },
    {
      hashSaltRounds: 10,

      async login(username, password) {
        // Find user based on the username, bail if no such user exists
        const user = await new this({ username }).fetch({ require: false });
        if (!user) {
          return false;
        }
        const hash = user.get("password");

        // hash the incoming cleartext password using the salt from the db
        // and compare if the generated hash matches the db hash
        const result = await bcrypt.compare(password, hash);
        if (!result) {
          return false;
        }

        // all is well
        return user;
      },

      async fetchById(id) {
        const user = await new this({ id }).fetch({ require: false });
        if (!user) {
          return false;
        }
        return user;
      },
    }
  );
};
