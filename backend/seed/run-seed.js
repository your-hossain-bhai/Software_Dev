const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Resource = require('../models/Resource');
const { jobs } = require('./jobs.seed');
const { resources } = require('./resources.seed');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set. Create .env file.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  await Job.deleteMany({});
  await Job.insertMany(jobs);
  console.log(`Seeded ${jobs.length} jobs`);

  await Resource.deleteMany({});
  await Resource.insertMany(resources);
  console.log(`Seeded ${resources.length} resources`);

  console.log('Seed complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
