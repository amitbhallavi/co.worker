import mongoose from 'mongoose';
import '../server/models/freelancerModel.js';
import '../server/models/previousWorks.js';
import '../server/models/userModel.js';

console.log('Registered models (from script):', mongoose.modelNames());
process.exit(0);
