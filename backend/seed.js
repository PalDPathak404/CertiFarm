/**
 * Database Seeder for CertiFarm
 * Run with: node seed.js
 * 
 * This creates demo users for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (inline for seeder)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['exporter', 'qa_agency', 'importer', 'admin'] },
  organization: String,
  phone: String,
  certificationNumber: String,
  did: String,
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const users = [
  {
    name: 'Rajesh Kumar',
    email: 'exporter@demo.com',
    password: 'demo123',
    role: 'exporter',
    organization: 'Kumar Agro Exports Pvt Ltd',
    phone: '+91 98765 43210',
  },
  {
    name: 'Priya Sharma',
    email: 'qa@demo.com',
    password: 'demo123',
    role: 'qa_agency',
    organization: 'Certified Quality Labs India',
    phone: '+91 98765 43211',
    certificationNumber: 'QA-2024-001',
  },
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin',
    organization: 'CertiFarm Platform',
    phone: '+91 98765 43212',
  },
  {
    name: 'Ahmed Hassan',
    email: 'importer@demo.com',
    password: 'demo123',
    role: 'importer',
    organization: 'Dubai Food Imports LLC',
    phone: '+971 50 123 4567',
  },
];

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certifarm');
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users
    for (const userData of users) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        did: `did:certifarm:${userData.role}-${Date.now()}`,
      });

      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Seeding complete!\n');
    console.log('Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('| Role     | Email              | Password |');
    console.log('─────────────────────────────────────');
    console.log('| Exporter | exporter@demo.com  | demo123  |');
    console.log('| QA Agency| qa@demo.com        | demo123  |');
    console.log('| Admin    | admin@demo.com     | demo123  |');
    console.log('| Importer | importer@demo.com  | demo123  |');
    console.log('─────────────────────────────────────');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();