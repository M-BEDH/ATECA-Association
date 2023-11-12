const Sauce = require('../models/sauces');
const fs = require('fs');

// creation de la sauce et enregistrement
exports.createSauce =  (req, res, _next) => {
    
    const objectSauce = JSON.parse(req.body.sauce);
    delete objectSauce._id;
    delete objectSauce._userId;
    const sauce = new Sauce ({
        ...objectSauce,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
    });   
    //vérification présence sauce uploader à la création avant sauvgarde 
    if (req.file) {
        sauce.save()  
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({ error}));
        
    }  else  {
        return 'Erreur veuillez choisir une image'
    }}; 
    
     
    // Modification de la sauce
    exports.modifySauce =  (req, res, _next) => {
        
        // Vérification si fichier image existe 
        const objectSauce = req.file ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` } 
            
            //sinon on récupère le corps de la requête
            : { ...req.body };
            
            //suppression de l'userId venant de la requête
            delete objectSauce._userId;
            
            //récupération en base de données de la sauce créée
            Sauce.findOne({_id: req.params.id})
            .then((sauce) => {
                if (sauce.userId != req.auth.userId) {
                    res.status(403).json({ message :  '<< : requête non autorisée >>'});
                } else  {

                // suppression de l'ancienne image du dossier si changement d'image    
                    if (req.file) {const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.deleteOne({_id:req.file})})
                    }
                    Sauce.updateOne({ _id: req.params.id}, { ...objectSauce, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                    .catch(error => res.status(401).json({ error }))
                } ;
            })
            .catch((error) => {
                res.status(400).json({ error });
            });
        };
        
        
        // Suppression de la sauce
        exports.deleteSauce = (req, res, _next) => {
            Sauce.findOne({ _id: req.params.id})
            .then(sauce => {
                if (sauce.userId != req.auth.userId) {
                    res.status(403).json({message: 'requête non autorisée'});
                } else {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                    });
                }} )
                .catch( error => {
                    res.status(500).json({ error });
                });
            };
            
            // Récupérer une seule sauce
            exports.getOneSauce = (req, res, _next) => {
                Sauce.findOne({ _id: req.params.id })
                .then(sauce => res.status(200).json(sauce))
                .catch(error => res.status(404).json({error}));
            };
            
            
            // Récupérer toutes les sauces
            exports.getAllSauce = (_req, res, _next) => {
                Sauce.find()
                .then(sauce => res.status(200).json(sauce))
                .catch(error => res.status(400).json({error}));
            };
            
            
            // fonction likes dislikes 
            exports.likeSauce =  (req, res, _next) => {
                let like = req.body.like
                let userId = req.body.userId
                
                //récupération en base de données de la sauce créée
                Sauce.findOne({_id: req.params.id})
                .then((sauce) => {
                    
                    
                    switch (like) {
                        
                        case 1:
                        if (like === 1 && !(sauce.usersLiked.find(user => user === userId)) && !(sauce.usersDisliked.find(user => user === userId)))
                        Sauce.updateOne({ _id: req.params.id}, {
                            $push:{
                                usersLiked: userId
                            },
                            $inc: {
                                likes: 1
                            }
                        })
                        .then(() => { res.status(201).json({ message: "like" }) })
                        .catch(error => { res.status(500).json({ error }) })
                        
                        else  {res.status(201).json({ message: "annuler le vote précédent pour re-voter" })}
                        break; 
                        
                        case -1:
                        if (like === -1 && !(sauce.usersLiked.find(user => user === userId)) && !(sauce.usersDisliked.find(user => user === userId)))
                        Sauce.updateOne({ _id: req.params.id}, {
                            $push:{
                                usersDisliked: userId
                            },
                            $inc: {
                                dislikes: 1
                            }
                        })
                        .then(() => { res.status(201).json({ message: "dislike" }) })
                        .catch(error => { res.status(500).json({ error }) }) 
                        
                        else {res.status(201).json({ message: "annuler le vote précédent pour re-voter" })}
                        break;
                        
                        case 0: 
                        if(like === 0) {
                            Sauce.findOne({_id: req.params.id})
                            .then((sauce) => {
                                if (sauce.usersLiked.find(user => user === userId)) {
                                    Sauce.updateOne({ _id: req.params.id}, {
                                        $pull:{
                                            usersLiked: userId
                                        },
                                        $inc: {
                                            likes: -1
                                        }
                                    })
                                    .then(() => { res.status(201).json({ message: "annulation du vote like" }) })
                                    .catch(error => { res.status(500).json({ error }) })
                                    
                                } else {
                                    if (sauce.usersDisliked.find(user => user === userId)) {
                                        Sauce.updateOne({ _id: req.params.id}, {
                                            $pull:{
                                                usersDisliked: userId
                                            },
                                            $inc: {
                                                dislikes: -1
                                            }})
                                            
                                            .then(() => { res.status(201).json({ message: "annulation du vote dislike" }) })
                                            .catch(error => { res.status(500).json({ error }) })
                                            
                                        } else {res.status(201).json({ message: "valeurs incompatibles" })}
                                    };
                                });
                            } 
                        };
                    });
                };
            
                
