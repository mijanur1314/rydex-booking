const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const res = await mongoose.connection.collection('bookings').deleteMany({
    status: { $nin: ['completed', 'cancelled', 'rejected'] }
  });
  console.log('Deleted active bookings:', res.deletedCount);
  process.exit(0);
});
