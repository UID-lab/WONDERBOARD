import mongoose from 'mongoose';

async function testWithDifferentOptions() {
  const uri = "mongodb+srv://gilbert:Gsix1410@eamsync-cluster.9sf3qtu.mongodb.net/teamsync_db?retryWrites=true&w=majority&appName=eamsync-cluster";
  
  console.log('🧪 Testing MongoDB connection with different options...');
  
  const connectionOptions = [
    {
      name: "Standard Options",
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
      }
    },
    {
      name: "With Buffer Commands",
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        bufferCommands: false,
        bufferMaxEntries: 0,
      }
    },
    {
      name: "Direct Connection",
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        directConnection: false,
        maxPoolSize: 10,
      }
    }
  ];
  
  for (const test of connectionOptions) {
    console.log(`\n🔄 Testing: ${test.name}`);
    
    try {
      await mongoose.connect(uri, test.options);
      
      console.log('✅ Connection successful!');
      console.log('📊 Database:', mongoose.connection.db?.databaseName);
      console.log('🏠 Host:', mongoose.connection.host);
      
      // Quick test
      const admin = mongoose.connection.db?.admin();
      const result = await admin?.ping();
      console.log('🏓 Ping result:', result);
      
      // List collections
      const collections = await mongoose.connection.db?.listCollections().toArray();
      console.log('📁 Collections:', collections?.length || 0);
      
      await mongoose.disconnect();
      console.log('🔌 Disconnected');
      
      console.log('\n🎉 SUCCESS! This configuration works!');
      console.log('🚀 Your server should now start successfully');
      
      return true;
      
    } catch (error: any) {
      console.log('❌ Failed:', error.message);
      
      // Disconnect if partially connected
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  console.log('🔍 This might be a network/firewall issue');
  
  return false;
}

testWithDifferentOptions().then((success) => {
  if (success) {
    console.log('\n📝 Next steps:');
    console.log('1. 🚀 Start your server: npm run server');
    console.log('2. 🧪 Test email functionality');
    console.log('3. 📧 Create tasks and assign them to users');
  } else {
    console.log('\n🛠️ Troubleshooting options:');
    console.log('1. 🌐 Try different network (mobile hotspot)');
    console.log('2. 🔥 Check firewall settings');
    console.log('3. 🏢 Check corporate network restrictions');
    console.log('4. ⏰ Wait and try again later');
  }
  
  process.exit(success ? 0 : 1);
});