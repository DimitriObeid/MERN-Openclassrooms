const express = require('express');

// Ci-dessus, nous créons un routeur Express. Jusqu'à présent, nous avions enregistré nos routes directement dans notre application (router.js).
// Maintenant, nous allons les enregistrer dans notre routeur Express, puis enregistrer celui-ci dans l'application.
const router = express.Router();

// On appelle le middleware "auth.js".
const auth = require('../middleware/auth');

// On appelle le middleware "multer-config".
// ATTENTION : L'ordre des middlewares est important ! Si nous plaçons "multer" avant le middleware d'authentification, même les images des requêtes non authentifiées seront enregistrées dans le serveur. Veillez à placer multer après "auth" !
const multer = require('../middleware/multer-config');

// On appelle le contrôlleur "stuff".
const stuffCtrl = require('../controllers/stuff');


/*
 * On voudrait uniquement la logique de routing, et que la logique métier soit définie dans le contrôleur "controllers/stuff.js".
 *
 * On n'a plus qu'à appeller la fonction "CreateThing", qui est définie dans le contrôleur, ainsi que les autres fonctions définies.
 *
 * "router.put()" : On intercepte uniquement les requêtes PUT dans cette route.
 * "router.delete()" : On intercepte unqiuement les requêtes DELETE dans cette route.
 * "router.get()" : On intercepte unqiuement les requêtes GET dans cette route.
*/


// Il est important de mettre le middleware "auth" avant le gestionnaire de routes, sinon ce dernier sera appelé en premier, et ne pourra pas récupérer le travail effectué par "auth" (toutes les routes doivent être authentifiées).
// On appelle également le middleware "multer" avant le gestionnaire de routes de création de ressources ET après le middleware d'authentification, car il faut que ce dernier ait pu faire son travail en amont (récupérer le token d'identification),

// Nous avons donc un middleware qui va authentifier nos requêtes et transmettre les infos aux middlewares suivants, c'est à dire nos gestionnaires de routes.
router.get('/', auth, stuffCtrl.getAllThings);
router.post('/', auth, multer, stuffCtrl.createThing);
router.get('/:id', auth, stuffCtrl.getOneThing);
router.put('/:id', auth, multer, stuffCtrl.modifyThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);


module.exports = router;
