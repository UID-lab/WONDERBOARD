import mongoose from 'mongoose';

async function testExactURI() {
  // The exact connection string you provided, with credentials filled in
  const testUri = "mongodb+srv://gilbert:Gsix1410@eamsync-cluster.9sf3qtu.mongodb.net/teamsync_db?retryWrites=true&w=majority&appName=eamsync-cluster";
  
  console.log('🧪 Testing exact connection string...');
  console.log('🔗 URI format: mongodb+srv://gilbert:****@eamsync-cluster.9sf3qtu.mongodb.net/teamsync_db');
  
  try {
    console.log('🔄 Connecting...');
    await mongoose.connect(testUri, {
      serverSelectionTimeoutMS: 15000, // 15 second timeout
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test database operations
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('📁 Collections found:', collections?.length || 0);
    
    if (collections && collections.length > 0) {
      console.log('📋 Collection names:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
    console.log('\n🎉 SUCCESS! Your MongoDB connection is working!');
    console.log('🚀 You can now start your server with: npm run server');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🌐 DNS/Network Issue:');
      console.error('- Check internet connection');
      console.error('- Try different network (mobile hotspot)');
      console.error('- Cluster might be in wrong region');
      console.error('- Firewall might be blocking MongoDB ports');
    } else if (error.message.includes('authentication')) {
      console.error('\n🔐 Authentication Issue:');
      console.error('- Verify username: gilbert');
      console.error('- Verify password: Gsix1410');
      console.error('- Check Database Access in Atlas');
    } else if (error.message.includes('IP')) {
      console.error('\n📡 IP Whitelist Issue:');
      console.error('- Ensure 0.0.0.0/0 is Active in Network Access');
    }
    
    return false;
  }
}

testExactURI().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});