import mongoose from 'mongoose';

async function testDirectConnection() {
  console.log('🧪 Testing direct MongoDB connection (non-SRV)...');
  
  // Convert SRV to direct connection using the hosts we found in DNS
  const directUri = "mongodb://gilbert:Gsix1410@ac-yjf2d5e-shard-00-00.9sf3qtu.mongodb.net:27017,ac-yjf2d5e-shard-00-01.9sf3qtu.mongodb.net:27017,ac-yjf2d5e-shard-00-02.9sf3qtu.mongodb.net:27017/teamsync_db?ssl=true&replicaSet=atlas-14jd8j-shard-0&authSource=admin&retryWrites=true&w=majority";
  
  console.log('🔗 Using direct connection to MongoDB hosts');
  console.log('📡 Hosts: ac-yjf2d5e-shard-00-00, 01, 02');
  
  try {
    console.log('🔄 Connecting...');
    await mongoose.connect(directUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✅ Direct connection successful!');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);
    console.log('🏠 Host:', mongoose.connection.host);
    
    // Test operations
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('📁 Collections found:', collections?.length || 0);
    
    if (collections && collections.length > 0) {
      console.log('📋 Collections:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    
    console.log('\n🎉 SUCCESS! Direct connection works!');
    console.log('📝 Update your .env file with this connection string:');
    console.log('MONGO_URI="' + directUri + '"');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Direct connection failed:', error.message);
    
    // Try with different replica set name
    console.log('\n🔄 Trying with different replica set...');
    
    const altUri = "mongodb://gilbert:Gsix1410@ac-yjf2d5e-shard-00-00.9sf3qtu.mongodb.net:27017,ac-yjf2d5e-shard-00-01.9sf3qtu.mongodb.net:27017,ac-yjf2d5e-shard-00-02.9sf3qtu.mongodb.net:27017/teamsync_db?ssl=true&authSource=admin&retryWrites=true&w=majority";
    
    try {
      await mongoose.connect(altUri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
      });
      
      console.log('✅ Alternative connection successful!');
      console.log('📊 Database:', mongoose.connection.db?.databaseName);
      
      const collections = await mongoose.connection.db?.listCollections().toArray();
      console.log('📁 Collections found:', collections?.length || 0);
      
      await mongoose.disconnect();
      
      console.log('\n🎉 SUCCESS! Alternative connection works!');
      console.log('📝 Update your .env file with this connection string:');
      console.log('MONGO_URI="' + altUri + '"');
      
      return true;
      
    } catch (error2: any) {
      console.error('❌ Alternative connection also failed:', error2.message);
      return false;
    }
  }
}

testDirectConnection().then((success) => {
  if (success) {
    console.log('\n🚀 Next steps:');
    console.log('1. 📝 Update the MONGO_URI in your .env file');
    console.log('2. 🚀 Start your server: npm run server');
    console.log('3. 📧 Test the email functionality!');
  } else {
    console.log('\n❌ Both SRV and direct connections failed');
    console.log('🔍 This suggests a network/firewall issue');
  }
  
  process.exit(success ? 0 : 1);
});