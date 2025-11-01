import mongoose from 'mongoose';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testNewMongoURI() {
  console.log('🔍 MongoDB Connection String Tester');
  console.log('=' .repeat(50));
  console.log('');
  console.log('📋 Instructions:');
  console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
  console.log('2. Click on your cluster');
  console.log('3. Click "Connect" → "Connect your application"');
  console.log('4. Copy the connection string');
  console.log('5. Replace <password> with: Gsix1410');
  console.log('');
  
  return new Promise((resolve) => {
    rl.question('📝 Paste your new MongoDB connection string here: ', async (newUri) => {
      console.log('\n🔄 Testing new connection string...');
      
      try {
        await mongoose.connect(newUri, {
          serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ Connection successful!');
        console.log('📊 Database:', mongoose.connection.db?.databaseName);
        console.log('🏠 Host:', mongoose.connection.host);
        
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('📁 Collections found:', collections?.length || 0);
        
        if (collections && collections.length > 0) {
          console.log('📋 Collections:', collections.map(c => c.name).join(', '));
        }
        
        await mongoose.disconnect();
        
        console.log('\n🎉 SUCCESS! Update your .env file with this connection string:');
        console.log('MONGO_URI="' + newUri + '"');
        
      } catch (error: any) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.message.includes('authentication failed')) {
          console.error('\n🔐 Check password in connection string');
        } else if (error.message.includes('IP')) {
          console.error('\n📡 IP whitelist issue - make sure 0.0.0.0/0 is active');
        } else {
          console.error('\n🔍 Check if cluster name/hostname is correct');
        }
      }
      
      rl.close();
      resolve(true);
    });
  });
}

testNewMongoURI();