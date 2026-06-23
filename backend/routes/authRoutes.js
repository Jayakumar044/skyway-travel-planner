const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

const { registerSchema, loginSchema } = require('../middleware/schemas');
const validate = require('../middleware/validate');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, getMe);

module.exports = router;
