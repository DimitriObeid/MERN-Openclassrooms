const Thing = require('../models/Thing');
const fs = require('fs');

// CRUD : Create, Read,Update, Delete

// ICI ==> C : Create (création de l'objet dans la BDD).

// On intercepte uniquement les requêtes POST dans cette route.
// En passant ce middleware à "router.post()" au lieu de "router.use()", il répondra uniquement aux requêtes de type POST.

// Ici, on crée une fonction qui définit la logique métier.
exports.createThing = (req, res, next) => {
    // On parse l'objet requête en premier. Il sera renvoyé au format JSON, en chaîne de caractères.
    console.log(req.body);
    const thingObject = JSON.parse(req.body.thing);

    // Ensuite, on supprime deux champs : "_id" (car il sera généré automatiquement par notre BDD) et "userId", qui correspond à la personne qui a créé l'objet, car nous ne voulons pas faire confiance au client (NE JAMAIS LUI FAIRE CONFIANCE). La nouvelle valeur du champ "userId" viendra du token d'authentification, car on est sûr qu'il est valide. Ça évite que quelqu'un de mal intentionné ne fasse une reqûete avec son token d'authentification en nous envoyant le "userId" de quelqu'un d'autre, ce qui pourrait faire croire que c'est cet autre utilisateur qui a créé l'objet.
    delete thingObject._id;
    delete thingObject._userId;

    // On crée une nouvelle instance de notre modèle "Thing";
    const thing = new Thing({
        ...thingObject,
        // On extrait le nouvel userID de l'objet "requête" grâce à notre middleware, puis nous allons générer l'URL de l'image. Multer ne donnant que le nom du fichier, nous devons générer l'URL par nous-même en faisant appel à des propriétés de l'objet "requête".
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // On enregistre maintenant cet objet dans la base de données.
    thing.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error })});
};

// ICI ==> R : Read (lecture de l'objet dans la BDD).

// L'application front-end va essayer de faire une requête à cette API.
exports.getOneThing = (req, res, next) => {
    // On accède à l'identifiant de l'objet via la méthode "findOne()", en y passant le paramètre de requête.
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllThings = (req, res, next) => {
    // On renvoie le tableau de tous les things retourné par la base (avec le code HTTP 200) au format JSON.
    // Contrairement à la méthode "findOne()", la méthode "find()" permet de trouver tous les objets stockés dans la base de données.
    Thing.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
};

// ICI ==> U : Update (mise à jour des informations de l'objet dans la BDD).

// On récupère un objet spécifique dans la base de données.
// / ":id" : Va servir à chercher un objet par son identifiant. Ce double point dit à Express que cette partie de la route est dynamique.
exports.modifyThing = (req, res, next) => {
    // Selon que l'utilisateur aura transmis un fichier ou pas, le format de la requête ne sera pas exactement le même, comme avec POST quand un fichier est transmis, où nous obtenons notre objet sous la forme d'une string.
    // Or, ce n'est pas le cas quand aucun fichier n'est transmis. On doit donc gérer ces deux cas (via la condition ternaire suivante).

    // Pour vérifier si c'est le cas, on regarde s'il y a un champ "file" dans notre objet "requête". On récupère ce dernier en parsant la string via la méthode "JSON.parse()", puis en recréant l'URL de l'image.
    // S'il n'y a pas de champ "file", alors on récupère simplement l'objet directement dans le corps de la requête.
    const thingObject = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };

    // On supprime le champ "userId" de la requête, qui correspond à la personne qui a créé l'objet, car nous ne voulons pas faire confiance au client (NE JAMAIS LUI FAIRE CONFIANCE). La nouvelle valeur du champ "userId" viendra du token d'authentification, car on est sûr qu'il est valide. Ça évite que quelqu'un de mal intentionné ne fasse une reqûete avec son token d'authentification en nous envoyant le "userId" de quelqu'un d'autre, ce qui pourrait faire croire que c'est cet autre utilisateur qui a créé l'objet.
    delete thingObject.userId;

    // On doit chercher cet objet dans notre BDD, pour s'assurer que l'utilisateur qui cherche à modifier ce dernier soit bien son propriétaire (l'utilisateur ayant initialement créé cet objet).
    // L'utilisation du mot-clé new avec un modèle Mongoose crée par défaut un champ "_id" . Utiliser ce mot-clé générerait une erreur, car nous tenterions de modifier un champ immuable dans un document de la base de données. Par conséquent, nous devons utiliser le paramètre "id" de la requête pour configurer notre Thing avec le même "_id" qu'avant.
    Thing.findOne({ _id: req.params.id })
        // On récupère notre objet, puis on s'assure qu'il appartienne bien à l'utilisateur qui envoie la requête de modification.
        .then((thing) => {
            // Si l'identifiant utilisateur récupéré dans la BDD est différent de celui qui vient du token de l'utilisateur actuellement connecté.
            if (thing.userId != req.auth.userId) {
                res.status(401).json({message: "Requête non-autorisée !" });
            } else {
                Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Modification effectuée avec succès !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// ICI ==> D : Delete (suppression de l'objet dans la BDD).
exports.deleteThing = (req, res, next) => {
//     // On n'a pas besoin de deuxième argument, puisque l'objet sera supprimé.
//     Thing.deleteOne({ _id: req.params.id })
//         .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
//         .catch(error => res.status(404).json({ error }));


    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            // Comme toujours, on vérifie que l'utilisateur effectuant la requête soit bel et bien le propriétaire de l'objet.
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: "Requête non-autorisée !" });
            } else {
                // On supprime l'objet de la BDD, et on supprime aussi l'image du système du fichiers.
                // On récupère l'URL enregistrée dans le champ "imageUrl", et recréer le chemin sur le système de fichier à partir de celle-ci.
                const filename = thing.imageUrl.split('/images/')[1];

                // Nous pouvons désormais faire la suppression en utilisant la méthode "()" du module "fs", avant de gérer le callback (une méthode qui va être appelée dès que la suppression aura eu lieu (elle est faite de manière asynchrone)).
                fs.unlink(`images/${filename}`, () => {
                    Thing.deleteOne({_id: req.params.id})
                        .then(() => {res.status(200).json({message: "Objet supprimé avec succès" })})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};
