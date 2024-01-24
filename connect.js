const config = require('./config');
const { dbUrl } = config;
const { MongoClient } = require('mongodb');


// eslint-disable-next-line no-unused-vars

const client = new MongoClient(config.dbUrl);

function connect() {
  try {
    //await client.connect();
    const db = client.db('burger_queen');
    console.log('Data base connected');
    return db;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { connect };
