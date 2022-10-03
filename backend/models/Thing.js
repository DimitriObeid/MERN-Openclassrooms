const mongoose = require('mongoose');

// Mongoose permet de faciliter la lecture et l'écriture dans une base de données MongoDB.'

// Schema est une méthode mise à disposition par le paquer "mongoose".
const thingSchema = mongoose.Schema({
    title: { type: String, required: true }, // "required: true" : Sans le titre de l'objet, il sera impossible de l'enregistrer dans la base de données.
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true },
    price: { type: Number, required: true },
});

// Pour utiliser ce modèle, il faut l'exporter.
module.exports = mongoose.model('Thing', thingSchema);
