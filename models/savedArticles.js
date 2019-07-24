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
    preview: {
        type: String,
      },
    
      publishedBy: {
        type: String,
      },
      datePublished:{
        type: String,
      },
      picture:{
        type: String,
        required: true
      },

    note:
        {type: Schema.ObjectId, 
        ref: "Note"}
    

});

var savedArticles = mongoose.model("savedArticles", savedArticlesSchema);

module.exports = savedArticles;