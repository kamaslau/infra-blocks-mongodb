import { getStatus } from 'http-response-text'
// https://www.npmjs.com/package/mongodb
import { MongoClient } from 'mongodb'

const url = "mongodb://localhost:27017"
const dbName = 'tests'

const client = new MongoClient(url)

// Languages supported by http-response-text, anything else falls back to English
const languages = ['en', 'zh', 'ja'] as const
type Language = (typeof languages)[number]

const detectLanguage = (): Language => {
  const locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG
    || Intl.DateTimeFormat().resolvedOptions().locale
  const language = locale.split(/[-_.]/)[0].toLowerCase()

  return languages.find((item) => item === language) ?? 'en'
}

const language = detectLanguage()

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
    const inserted = await getStatus(201, language);
    console.log(`Insert (${inserted.code} ${inserted.message}) =>`, insertResult);

    // Find All Documents
    const findResult = await collection.find({}).toArray();
    const found = await getStatus(findResult.length > 0 ? 200 : 404, language);
    console.log(`FindAll (${found.code} ${found.message}) =>`, findResult);

  } catch (error) {
    const failure = await getStatus(500, language);
    console.error(`Run (${failure.code} ${failure.message}) =>`, error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run();
