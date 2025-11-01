import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Current MongoDB URI Analysis:');
console.log('=' .repeat(50));

const currentUri = process.env.MONGO_URI;
console.log('📋 Current URI:', currentUri);

if (currentUri) {
  const match = currentUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
  if (match) {
    console.log('👤 Username:', match[1]);
    console.log('🔑 Password:', '****' + match[2].slice(-4));
    console.log('🏠 Cluster Host:', match[3]);
    console.log('📊 Database:', match[4].split('?')[0]);
    
    console.log('\n🔍 Cluster Host Analysis:');
    const hostParts = match[3].split('.');
    console.log('📡 Cluster Name:', hostParts[0]);
    console.log('🆔 Cluster ID:', hostParts[1]);
    console.log('🌐 Domain:', hostParts.slice(2).join('.'));
  }
}

console.log('\n📝 To fix this:');
console.log('1. 🌐 Go to MongoDB Atlas');
console.log('2. 🔍 Find your cluster (might have different name/ID)');
console.log('3. 📋 Click "Connect" → "Connect your application"');
console.log('4. 📝 Copy the new connection string');
console.log('5. 🔄 Update MONGO_URI in .env file');

console.log('\n🧪 Test with: npm run test-new-mongo-uri');