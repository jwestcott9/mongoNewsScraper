var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var savedArticlesSchema = new Schema({

    title:{
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    },

    note:{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }

});

var savedArticles = mongoose.model("savedArticles", savedArticlesSchema);

module.exports = savedArticles;