const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://DimitriOBEID:OBEIDCPP@cluster0.oueswi9.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Rappel : l'appel de la méthode "express" permet de créer une application Express.
const app = express();

// Ce middleware intercepte toutes les requêtes qui ont un "content-type" JSON et met à disposition ce contenu (corps de la requête) sur l'objet requeête.
app.use(express.json());

/*
 * Ces headers permettent :
 *  - d'accéder à notre API depuis n'importe quelle origine ( '*' ) ;
 *  - d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
 *  - d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
*/

// Il s'agit du premier middleware exécuté par le serveur. C'est un middleware général, il n'y a pas besoin de mettre de routes en argument.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // '*' : Tout le monde a le droit d'accéder à l'API.
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // On donne l'autorisation d'utiliser certains headers sur l'objet requête.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // On en fait de même avec certaines requêtes.
  next();
});

app.use(bodyParser.json());

// Pour utiliser cette route, on utilise le routeur qui est exposé par "stuffRoutes".
// L'ancienne logique (désormais utilisée dans le fichier "./routes/stuff") est importée et appliquée à la même route. Ce qui est importé est le routeur, exporté par le fichier mentionné précédemment.
app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);

// Nous devons indiquer à notre "app.js" comment traiter les requêtes vers la route "/image", en rendant notre dossier "images" statique.
// Pour ce faire, on utilise le middleware "static" fourni par Express pour le traitement de fichiers statiques. On récupère le répertoire dans lequel s'exécute notre serveur, avant d'y concaténer le répertoire "images" pour obtenir le chemin complet sur le disque du serveur.
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
