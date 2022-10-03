const multer = require('multer');

// On prépare un dictionnaire de mimetypes (qui est un objet), qui enregistre les différents types de mimetype que l'on peut avoir depuis le front-end.
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// La méthode "diskStorage()" permet d'enregistrer un fichier sur le disque dur.
// L'objet de configuration que l'on passe en argument a besoin de deux arguments : "destination", le chemin du dossier d'enregistrement, qui est une fonction expliquant à Multer dans quel dossier du serveur enregistrer les fichiers, et "filename", le nom du fichier à enregistrer sur le serveur.
const storage = multer.diskStorage({
    // On définit une fonction.
    destination: (req, file, callback) => {
        // On appelle directement le callback. La valeur 'null' indique qu'il n'y a eu aucune erreur à ce niveau-là. Le deuxième argument est le nom du dossier où enregistrer les images (notre dossier 'images').
        callback(null, 'images');
    },

    // On y définit une autre fonction, prenant en arguments la requête, le fichier et un callback.
    filename: (req, file, callback) => {
        // On va générer le nouveau nom du fichier (avant l'extension), pour éviter de se retrouver avec deux fichiers possédant le même nom entré par l'utilisateur.
        // On a accès au nom original du fichier avec la propriété "originalname".
        // On remplace les espaces entre les mots du nom du fichier avec la méthode "split()", car leur présence peut poser des problèmes côté serveur selon le système d'exploitation.
        const name = file.originalname.split(' ').join('_');

        // N'ayant pas accès à l'extension du nom de fichier, on peur accéder à son mimetype.
        const extension = MIME_TYPES[file.mimetype];

        // On appelle maintenant le callback. On crée le nom du fichier dans le deuxième argument en y ajoutant un timestamp pour rendre son nom unique.
        callback(null, name + Date.now() + '.' + extension);
    }
});

// On appelle la méthode "multer()", à laquelle on passe notre objet "storage", avant d'appeler la méthode "single()" pour déclarer qu'il s'agit d'un fichier unique de type "image", et non d'un groupe de fichiers.
module.exports = multer({storage: storage }).single('image');

/*
 * "multer" est un package de gestion de fichiers.
 * Sa méthode "diskStorage()" configure le chemin et le nom de fichier pour les fichiers entrants.
 * Sa méthode "single()" crée un middleware qui capture les fichiers d'un certain type (passé en argument), et les enregistre au système de fichiers du serveur à l'aide du storage configuré.
 * Avant de pouvoir appliquer notre middleware à nos routes stuff, nous devrons les modifier quelque peu, car la structure des données entrantes n'est pas tout à fait la même avec des fichiers et des données JSON.
*/
