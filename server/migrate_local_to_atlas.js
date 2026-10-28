/**
 * Migration Script: Local MongoDB Compass -> MongoDB Atlas
 * Usage: node migrate_local_to_atlas.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const LOCAL_URI = 'mongodb://127.0.0.1:27017/national_scholarship_details';
const ATLAS_URI = process.env.MONGO_URI;

async function migrateData() {
  if (!ATLAS_URI || !ATLAS_URI.startsWith('mongodb+srv://')) {
    console.error('❌ Please set your MongoDB Atlas connection string in server/.env (MONGO_URI) first.');
    process.exit(1);
  }

  console.log('🔄 Connecting to Local MongoDB Compass...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✓ Connected to Local MongoDB.');

  console.log('🔄 Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✓ Connected to MongoDB Atlas.');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`\nFound ${collections.length} collections to migrate:`);

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    const localCollection = localConn.db.collection(colName);
    const atlasCollection = atlasConn.db.collection(colName);

    const count = await localCollection.countDocuments();
    if (count === 0) {
      console.log(`  ⚪ ${colName}: 0 documents (skipped)`);
      continue;
    }

    const docs = await localCollection.find({}).toArray();
    
    // Optional: clear existing to avoid duplicates on fresh migrate
    await atlasCollection.deleteMany({});
    await atlasCollection.insertMany(docs);

    console.log(`  ✅ ${colName}: Migrated ${docs.length} documents.`);
  }

  console.log('\n🎉 All collections successfully migrated to MongoDB Atlas!');
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrateData().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
