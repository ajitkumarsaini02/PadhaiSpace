const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('\n❌ Usage: node createAdmin.js <email> <password>');
  console.log('Example: node createAdmin.js myadmin@padhaispace.com mySecretPass123\n');
  process.exit(1);
}

async function createAdmin() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/padhaiSpace';
  
  try {
    await mongoose.connect(mongoURI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await mongoose.connection.db.collection('users').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          name: 'System Admin',
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'admin',
          college: 'PadhaiSpace Head Office',
          branch: 'CSE',
          semester: 8,
          bookmarks: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('\n====================================================');
    console.log(`✅ Admin Account Created Successfully!`);
    console.log(`📧 Email:    ${email.toLowerCase()}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🔒 Role:     admin`);
    console.log(`🗄️ Database: padhaiSpace.users`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
