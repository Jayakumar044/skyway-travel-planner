const Trip = require('../models/Trip');
const https = require('https');

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips.' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trip.' });
  }
};

exports.generateNewTrip = async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user.id;

  if (!destination || !durationDays || !budgetTier) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const prompt = `You are an expert travel planner. Create a detailed ${durationDays}-day travel itinerary for ${destination}.
Budget tier: ${budgetTier} (Low = budget backpacker, Medium = comfortable mid-range, High = luxury).
Traveler interests: ${interests && interests.length > 0 ? interests.join(', ') : 'General sightseeing'}.

Return ONLY a valid JSON object with NO extra text, NO markdown, NO code blocks. Use this exact structure:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "Activity name",
          "description": "2-3 sentence description",
          "estimatedCostUSD": 25,
          "timeOfDay": "Morning"
        },
        {
          "title": "Activity name",
          "description": "2-3 sentence description",
          "estimatedCostUSD": 15,
          "timeOfDay": "Afternoon"
        },
        {
          "title": "Activity name",
          "description": "2-3 sentence description",
          "estimatedCostUSD": 40,
          "timeOfDay": "Evening"
        }
      ]
    }
  ],
  "hotels": [
    { "name": "Hotel name", "tier": "Budget", "estimatedCostNightUSD": 30, "rating": "4.2/5", "amenities": ["WiFi"] },
    { "name": "Hotel name", "tier": "Mid-range", "estimatedCostNightUSD": 80, "rating": "4.5/5", "amenities": ["WiFi", "Pool"] },
    { "name": "Hotel name", "tier": "Luxury", "estimatedCostNightUSD": 200, "rating": "4.8/5", "amenities": ["Spa"] }
  ],
  "estimatedBudget": { "transport": 150, "accommodation": 200, "food": 180, "activities": 120, "total": 650 },
  "packingList": [{ "item": "Passport", "category": "Docs", "isPacked": false }],
  "weatherInfo": { "season": "Summer", "avgTemp": "28°C", "conditions": "Sunny" }
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    // Diagnostic log
    try {
      const diagUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const diagData = await fetch(diagUrl).then(r => r.json());
      console.log('DIAGNOSTIC - Models:', diagData.models ? diagData.models.map(m => m.name).slice(0, 3) : 'ERR' + JSON.stringify(diagData));
    } catch (e) { }

    const models = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let aiData = null;
    let lastError = null;

    for (const model of models) {
      try {
        if (lastError) {
          console.log('Waiting 3s before retry with next model...');
          await new Promise(r => setTimeout(r, 3000));
        }
        console.log(`Trying ${model} with https module...`);
        const response = await new Promise((resolve, reject) => {
          const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
          const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(data) }));
          });
          req.on('error', e => reject(e));
          req.write(body);
          req.end();
        });

        if (response.statusCode === 200 && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = response.data.candidates[0].content.parts[0].text;
          const clean = text.replace(/```json|```/g, '').trim();
          aiData = JSON.parse(clean);
          console.log(`Success with ${model}`);
          break;
        } else {
          console.error(`${model} failed:`, response.statusCode, response.data?.error || 'No text');
        }
      } catch (err) {
        console.error(`${model} try catch fail:`, err.message);
      }
    }

    if (!aiData) throw new Error('AI generation failed across all models');

    const trip = await Trip.create({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: interests || [],
      itinerary: aiData.itinerary || [],
      hotels: aiData.hotels || [],
      estimatedBudget: aiData.estimatedBudget || {},
      packingList: aiData.packingList || [],
      weatherInfo: aiData.weatherInfo || {}
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Final Trip Generation Failure:', error);
    res.status(500).json({ message: 'Failed to generate trip.', error: error.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    Object.assign(trip, req.body);
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update trip.' });
  }
};

exports.regenerateDay = async (req, res) => {
  const { dayNumber, feedback } = req.body;
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const prompt = `Regenerate Day ${dayNumber} for ${trip.destination}. User feedback: ${feedback}. Return JSON with "activities" array.`;
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const clean = text.replace(/```json|```/g, '').trim();
    const dayData = JSON.parse(clean);

    const idx = trip.itinerary.findIndex(d => d.dayNumber === dayNumber);
    if (idx !== -1) {
      trip.itinerary[idx].activities = dayData.activities;
      await trip.save();
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Failed to regenerate day.' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete trip.' });
  }
};
