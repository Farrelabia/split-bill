const { MongoClient } = require('mongodb');

async function connectDatabase(uri, databaseName) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const bills = client.db(databaseName).collection('bills');
    await bills.createIndex({ shareCode: 1 }, { unique: true });
    return { client, bills };
  } catch (error) {
    await client.close();
    throw error;
  }
}

module.exports = { connectDatabase };
