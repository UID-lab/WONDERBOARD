import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function simpleMongoTest() {
  const uri = process.env.MONGO_URI as string;
  console.log('🔍 Testing with native MongoDB driver...');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  
  try {
    console.log('🔄 Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('teamsync_db');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.length);
    
    await client.close();
    console.log('🔌 Disconnected');
    return true;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

simpleMongoTest();