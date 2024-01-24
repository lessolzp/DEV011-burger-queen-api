module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
    const db = connect();
    const collection = db.collection('users');
    const userCollection = await collection.findOne();
  },
};
