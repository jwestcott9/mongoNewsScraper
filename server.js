var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8000;

// Initialize Express
var app = express();

require("./routes/htmlRoutes")(app);
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", {
  useNewUrlParser: true
});

// Routes

app.get("/scrapePreview", function (req, res) {
  axios.get(req.body.url).then(function (response) {
    let $ = cheerio.load(response.data);
    $("div.preview").each(function (i, element) {
      let result = {};
      res
    })
  })
})

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.propublica.org/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.story-entry").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("div.description")
        .children("h1.hed")
        .children("a")
        .text();
      result.preview = $(this)
        .children("div.description")
        .children("h2.dek")
        .text();
      result.publishedBy = $(this)
        .children("div.description")
        .children("div.metadata")
        .children("p.byline")
        .text();
      result.datePublished = $(this)
        .children("div.description")
        .children("div.metadata")
        .children("p.timestamp")
        .children("time.timestamp")
        .text();
      result.link = $(this)
        .children("div.description")
        .children("h1.hed")
        .children("a")
        .attr("href");
      result.picture = $(this)
      .children("div.lead-art")
      .children("a")
      .children("img")
      .attr("src");
      console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article.insertMany(result, {
          ordered: false
        })
        .then(function (result) {
          res.json(result)
          // View the added result in the console
          console.log(result);
        })
        .catch(function (err) {
          // If an error occurred, log it
          res.json(err);
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).sort({datePublished:1})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.delete("/deleteAllArticles/", function (req, res) {
  db.Article.remove({}).then(function (data) {
    console.log("deleted all of the Articles")
    console.log(data);
    res.json(data);
  })
})

app.get("/getSavedArticles", function (req, res) {
  db.savedArticles.find({}, function (error, found) {
    if (error) {
      console.log(error)
    } else {
      res.send(found);
    }
  })
});

app.delete("/clearComments", function (req, res) {
  db.Note.remove({}).then(function (data) {
    console.log("removed all saved notes")
    res.json(data);
  })
})

app.delete("/clearSavedArticles", function (req, res) {
  db.savedArticles.remove({}).then(function (data) {
    console.log("deleted Saved Articles")
    res.json(data);
    return db.Note.remove({})
  })
})
app.put("/updateNote/:id", function (req, res) {
  db.Note.findOneAndUpdate({
      _id: req.params.id
    }, {
      title: req.body.title,
      body: req.body.body
    })
    .then(function (data) {
      console.log("Updated Data!");

      return db.Note.findOne({
        _id: req.params.id
      }).then(function (data) {
        res.json(data);
      })
    })
    .catch(function (err) {
      console.log("I am the catch");
      res.json(err);
    })
})

app.post("/savedArticles/:id", function (req, res) {
  db.Article.findOne({
    _id: req.params.id
  }).then(function (result) {
    let title = result.title;
    let link = result.link;
    let preview = result.preview;
    let picture = result.picture;
    let publishedBy = result.publishedBy;
    let datePublished = result.datePublished;
    

    let data = {
      title,
      link,
      preview,
      picture, 
      publishedBy,
      datePublished
    }
    db.savedArticles.insertMany(data, {
      ordered: false
    }).then(function (created) {
      console.log(created);
      res.json(created);
    });
  });
});


// Get the note
app.get("/notesForArticle/:id/", function (req, res) {
  db.savedArticles.findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle)
    })
    .catch(function (err) {
      res.json(err);
    })
})



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.savedArticles.findOne({
      _id: req.params.id
    })
    // ..and populate all of the notes associated with it
    .populate("Note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Post notes and save the id at the SAMMMEEEE time
// Route for saving/updating an Article's associated Notebody
app.post("/saveArticleNotes/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.savedArticles.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.delete("/deleteSaved/:id", function (req, res) {
  db.savedArticles.remove({
      _id: req.params.id
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    })
})

app.delete("/deleteNote/:id", function (req, res) {
  db.Note.remove({
      _id: req.params.id
    })
    .then(function (note) {
      res.json(note);
    })
    .catch(function (err) {
      res.json(err);
    })
})

module.exports = app;
// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});