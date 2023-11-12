const mongoose = require('mongoose');

//création d'un schéma de données pour les images
const imageSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: false },
    mainPepper: { type: String, required: false },
    imageUrl: { type: String },
    heat: { type: Number, required: false },

    //gestion des likes
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
    usersLiked: { type: Array  , required: true, default: [] },
    usersDisliked: { type: Array , required: true, default: [] }
});

module.exports = mongoose.model('image', imageSchema);

