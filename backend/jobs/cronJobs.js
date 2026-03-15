const cron = require('node-cron');
const User = require('../models/User');
const { generateDailyReport } = require('../services/reportService');

// Runs every day at 11:59 PM
cron.schedule('59 23 * * *', async () => {
  console.log('Running nightly report generation...');
  try {
    const users = await User.find({});
    const today = new Date();
    for (const user of users) {
      await generateDailyReport(user._id, today);
      console.log(`Report generated for user: ${user.email}`);
    }
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

console.log('Cron jobs initialized');
