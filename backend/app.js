//import dépendances
const express = require('express');
const mongoose = require('mongoose');

//Prévention  - sécurité 
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

//limiter les demandes répétées à API 
const  rateLimit = require ('express-rate-limit')
const limiteur = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100, // Limitez chaque IP à 100 demandes par `fenêtre` ( ici, par 30 minutes )
  message: "Trop de requêtes",
  standardHeaders: true, // Informations sur la limite de taux de retour dans les en-têtes `RateLimit- *`
  legacyHeaders: false, // Désactiver les en-têtes `X-RateLimit- *`
});

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user')
const path = require('path');

// connection avec la base de données
mongoose.connect('mongodb+srv://PremierUtilisateur:lm57u6kdOaNznVjA@cluster0.cjxvii3.mongodb.net/myDataBase?retryWrites=true&w=majority',
{ useNewUrlParser: true,
  useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
  
  //configuration express 
  const app = express();
  app.use(express.json());
  app.use(mongoSanitize());
  app.use(helmet.xssFilter());
  app.use(limiteur);
  
  
  app.use((req, res, next) => {
    //accéder à notre API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    //ajouter les headers mentionnés aux requêtes envoyées vers notre API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    
    //envoyer des requêtes avec les méthodes mentionnées
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
  
  //routes
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/api/sauces', saucesRoutes);
  app.use('/api/auth', userRoutes);
  
  module.exports = app;
  
