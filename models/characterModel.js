const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let characterModel = new Schema(
    {
        name: { type: String },
        region: { type: String },
        element: { type: String },
    }
);

module.exports = mongoose.model('Character', characterModel);