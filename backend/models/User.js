const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    // "unique: true" empêche les utilisateurs de s'enregistrer plusieurs fois avec la même adresse mail.
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// On va appliquer le validateur unique de Mongoose au schéma de données avant d'en faire un modèle.'
userSchema.plugin(uniqueValidator);

// Le deuxième argument est le schéma de données.
module.exports = mongoose.model('User', userSchema);

/*
 * EN RÉSUMÉ :
 *  - bcrypt est un package de cryptage nstallable avec npm.
 *  - Le paquer mongoose-unique-validator améliore les messages d'erreur lors de l'enregistrement de données uniques.
*/
