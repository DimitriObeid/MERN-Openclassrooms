const jwt = require('jsonwebtoken')

// Cette fonction sera notre middleware.

// On récupère d'abord le token de l'utilisateur.
module.exports = (req, res, next) => {
    try {
        // On récupère le header, puis on le splite (on divise la chaîne de caractères en un tableau autour de l'espace ' ' qui se trouve entre notre mot clé "Bearer" et le token ([1], le deuxième élément du tableau)).
        const token = req.headers.authorization.split(' ')[1];

        // Maintenant que nous avons le token, il faut le décoder. Les arguments à passer via la méthode "verify" sont : le token récupéré, et la clé secrète.
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

        // On récupère l'identifiant d'utilisateur (propriété "userId" récupérée via la méthode "verify").
        const userId = decodedToken.userId;

        // Nous allons rajouter cette valeur à l'objet "request", qui est transmis aux routes qui seront appelées par la suite.
        req.auth = {
            userId: userId,
        };

        next();
    } catch(error) {
        console.error();
        console.error("----------------------------------------------------");
        console.error("La récupération du token de l'utilisateur a échoué !\n");
        console.error("L'erreur s'est produite dans ce fichier : " + __filename + '\n');
        res.status(401).json({ error });
    }
};
