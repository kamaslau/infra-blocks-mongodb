import { getStatus, listLanguages } from 'http-response-text'
import { MongoClient, MongoServerError } from 'mongodb'

const dbUrl = process.env.DB_URL ?? 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME ?? 'tests'

// Whatever the installed version ships, anything else falls back to English
const languages = await listLanguages()

const detectLanguage = () => {
  const locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG
    || Intl.DateTimeFormat().resolvedOptions().locale
  const language = locale.split(/[-_.]/)[0].toLowerCase()

  return [...languages].find((item) => item === language) ?? 'en'
}

const language = detectLanguage()

const report = async (code: number, label: string, payload?: unknown) => {
  const { message } = await getStatus(code, language)
  const line = `${label} (${code} ${message})`
  const detail = payload instanceof Error ? payload.message || payload.name : payload

  if (code < 400) console.log(line, detail ?? '')
  else console.error(line, detail ?? '')
}

const run = async () => {
  // Without this the driver keeps retrying for 30s before admitting nothing answers
  const client = new MongoClient(dbUrl, { serverSelectionTimeoutMS: 5_000 })

  try {
    // Connect the client to the server
    await client.connect()

    // Establish and verify connection
    await client.db(dbName).command({ ping: 1 })
    await report(200, 'Connect', dbUrl)
  } catch (error) {
    // Connection failure: nothing below this point can be trusted
    process.exitCode = 1
    await report(503, 'Connect', error)
    await client.close()
    return
  }

  const collection = client.db(dbName).collection('subject')

  // Insert documents
  try {
    const { insertedCount } = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }])
    await report(201, 'Insert', { insertedCount })
  } catch (error) {
    // 11000 is a duplicate key: the write was refused, the server is fine
    const code = error instanceof MongoServerError && error.code === 11000 ? 409 : 500
    process.exitCode = 1
    await report(code, 'Insert', error)
  }

  // Find all documents
  try {
    const documents = await collection.find({}).toArray()
    await report(documents.length > 0 ? 200 : 404, 'FindAll', { count: documents.length })
  } catch (error) {
    process.exitCode = 1
    await report(500, 'FindAll', error)
  }

  // Ensures that the client will close when you finish/error
  await client.close()
}

run()
