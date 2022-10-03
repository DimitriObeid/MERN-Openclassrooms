const bcrypt = require('bcrypt');       // Paquet nécessaire au hashage de MDP.
const jwt = require('jsonwebtoken');    // Paquet nécessaire à la création de tokens d'authentification.

/*
 * Les JSON web tokens sont des tokens chiffrés qui peuvent être utilisés pour l'autorisation.
 *
 * La méthode "sign()" du package "jsonwebtoken" utilise une clé secrète pour chiffrer un token qui peut contenir un payload personnalisé et avoir une validité limitée.
*/

const User = require('../models/User');

// Fonction de création de nouveaux utilisateurs dans la BDD à partir de la page d'inscription (depuis le front-end).
exports.signup = (req, res, next) => {
    // Toute première chose à faire : hasher le MDP (naturellement stocké dans le champ "password"). Il s'agit d'une fonction asynchrone, donc on aura un bloc "then()" et un bloc "catch()".
    // Le deuxième argument est un "salt", il s'agit du nombre de fois où un algorithme est exécuté. 10 tours suffisent à créer un MDP sécurisé via l'algorithme de hashage de bcrypt. Au plus le nombre de tours est élevé, au plus le hashage prendra de temps, mais au plus de MDP sera sécurisé.
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            // On enregistre l'utilisateur dans la BDD.
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction de connexion d'utilisateurs
exports.login = (req, res, next) => {
    // Note : les accolades entre les parenthèses d'une méthode indiquent que l'on passe en objet en argument.
    // => : Ce signe signifie que l'on récupère la valeur trouvée par notre requête.
    User.findOne({ email : req.body.email })
        .then(user => {
            if (user === null) {
                // Il faut garder volontairement flou le message renvoyé, car nous ne voulons pas dire à notre client que l'utilisateur n'est pas enregistré, pour une raison de sécurité, car il s'agirait d'une fuite de données, et personne ne devrait pouvoir vérifier si une autre personne est inscrite chez nous.
                console.error();
                console.error("---------------------------------------------")
                console.error("Paire identifiant / mot de passe incorrecte !\n");
                console.error("L'erreur s'est produite dans ce fichier : " + __filename + ", dans la condition \"if (user === null)\"\n");

                return res.status(401).json({ message: 'Paire identifiant / mot de passe incorrecte !' });
            }
            // Puisque l'utilisateur existe, il faut comparer le mot de passe entré avec le mot de passe enregistré.
            // Le premier argument de la méthode "compare()" est le MDP entré par l'utilisateur cherchant à se connecter. Le deuxième argument est le MDP stocké dans la BDD.

            // La méthode "compare" de bcrypt compare un string avec un hash pour, par exemple, vérifier si un mot de passe entré par l'utilisateur correspond à un hash sécurisé enregistré en base de données. Cela montre que même bcrypt ne peut pas décrypter ses propres hashs.
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si le MDP n'est pas valide, alors on retourne le code HTTP 401 (authentification échouée) et un message qui NE PRÉCISE PAS quel champ est incorrect, pour des raisons de sécurité.
                    if (!valid) {
                        console.error();
                        console.error("---------------------------------------------")
                        console.error("Paire identifiant / mot de passe incorrecte !\n");
                        console.error("L'erreur s'est produite dans ce fichier : " + __filename + ", dans la contion \"if (!valid)\"\n");

                        return res.status(401).json({ error: 'Paire identifiant / mot de passe incorrecte !' });
                    }
                    // On retourne un code HTTP 200 avec un objet contenant les informations nécessaires à l'authentification des requêtes émises par la suite par notre client (un identifiant utilisateur et un token).
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            // 1er argument : l'identifiant utilisateur
                            // 2ème argument : la clé secrète
                            // 3ème argument : argument de configuration (expiration du token dans X heures)
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
