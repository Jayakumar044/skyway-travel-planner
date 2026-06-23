const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getTrips,
  getTripById,
  generateNewTrip,
  updateTrip,
  regenerateDay,
  deleteTrip
} = require('../controllers/tripController');

const { tripGenerateSchema, updateTripSchema, regenerateDaySchema } = require('../middleware/schemas');
const validate = require('../middleware/validate');

router.get('/', auth, getTrips);
router.get('/:id', auth, getTripById);
router.post('/generate', auth, validate(tripGenerateSchema), generateNewTrip);
router.put('/:id', auth, validate(updateTripSchema), updateTrip);
router.post('/:id/regenerate-day', auth, validate(regenerateDaySchema), regenerateDay);
router.delete('/:id', auth, deleteTrip);

module.exports = router;
