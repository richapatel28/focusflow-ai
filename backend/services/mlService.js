const axios = require('axios');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const predictFocusDrift = async (features) => {
  try {
    const res = await axios.post(`${ML_URL}/predict/focus-drift`, features, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error('ML focus drift error:', err.message);
    return { drifting: false, probability: 0 };
  }
};

const predictProductivity = async (features) => {
  try {
    const res = await axios.post(`${ML_URL}/predict/productivity`, features, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error('ML productivity error:', err.message);
    return { label: 'Unknown', confidence: 0, score: 50 };
  }
};

const predictBurnout = async (features) => {
  try {
    const res = await axios.post(`${ML_URL}/predict/burnout`, features, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error('ML burnout error:', err.message);
    return { risk_percent: 0, risk_level: 'Low' };
  }
};

const predictAdherence = async (features) => {
  try {
    const res = await axios.post(`${ML_URL}/predict/adherence`, features, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error('ML adherence error:', err.message);
    return { label: 'On-time', probabilities: {} };
  }
};

module.exports = { predictFocusDrift, predictProductivity, predictBurnout, predictAdherence };