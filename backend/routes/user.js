// Comme d'habitude, on a besoin d'Express pour créer un routeur.
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Ce sont des routes POST, car le front-end va également envoyer des informations (adresse mail et le MDP).
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
