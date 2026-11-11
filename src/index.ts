// https://www.npmjs.com/package/mongodb
import { MongoClient } from 'mongodb'

const url = "mongodb://localhost:27017"
const dbName = 'tests'

const client = new MongoClient(url)

const run = async () => {
  try {
    // Connect the client to the server
    await client.connect();
    const db = client.db(dbName)

    // Establish and verify connection
    await db.command({ ping: 1 });
    console.log("Connected successfully to server");

    /*
     * Demo codes
     */
    const collection = db.collection('subject');

    // Insert a Document
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Inserted documents =>', insertResult);

    // Find All Documents
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
