$.getJSON("/getSavedArticles", function (data) {
  console.log(data)
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#savedArticles").append(
      `<div class = "container">
      <div class="card articleFeed" data-id = "${data[i]._id}">
      <h5 class="card-header" >${data[i].title}</h5>
      <div class="card-body" data-id = "${data[i]._id}">
      <div class = "row"> 
      <a class= "col-md-3"  href="${data[i].link}" target = "_blank"> 
      <img class="thumbnail" src = "${data[i].picture}" href="${data[i].link}">
      </a> 
      <div class ="col-md-9">
    <a  card-text" href="${data[i].link}" target = "_blank">${data[i].preview}</a>
    <br/>
    <button  class="btn btn-primary commentButton" data-id="${data[i]._id}"  data-toggle = "modal" data-target="#exampleModalLong">Article Notes</button>
<button class = "deleteArticle btn btn-danger" > Delete </button>
    </div>
    </div>  
 
  <p class ="publishedData">${data[i].publishedBy} ${data[i].datePublished}</p>
</div>
</div>
</div>`

    );
  }
});

// this is the parent function for the CRUD functionality of the app 
// there neads to still be a grab all notes ajax call nested in this function
function printNotes(data) {
  console.log(data);
  console.log(data.note.body);
  // The title of the article
  // $("#poplateNotes").innerHTML("");
  $("#populateNotes").append("<h5 class = 'topBorder' id= 'savedNoteTitle'>" + data.note.title + "</h5>")

  $("#populateNotes").append(`
    <p class = "bottomBorder" id= "noteBody" >${data.note.body}</p>
    <button class = 'btn btn-danger delete-button noteOptions' data-id = '${data.note._id}' > Delete Note</button>
    <button class = 'btn btn-success editNote noteOptions' data-id = '${data.note._id}'> Edit Note </button>
    `)
  //   "<p class= 'bottomBorder' id = 'noteBody' >" + data.note.body + 
  // "<br/><br/> <button class = 'btn btn-danger delete-button delete-this-note' data-id ='"+data.note._id+"' id='delete-this-note'>Delete Note</button> <button class = 'btn btn-success editNote' >Edit Note</button></p>");


  if (data.note) {
    // Place the title of the note in the title input
    $("#titleinput").val(data.note.title);
    // Place the body of the note in the body textarea
    $("#bodyinput").val(data.note.body);
  }
}

// this function will make a call to the database and clear all of the articles in the Saved Database
$(document).on("click", "#clearSaved", function () {
  $.ajax({
    type: "DELETE",
    url: "/clearSavedArticles"
  }).then(() =>
    location.reload()
  )
})
// this provides functionality to the delete a specific article button
$(document).on("click", ".deleteArticle", function () {
  let thisId = $(this).parent().attr("data-id");

  $.ajax({
    type: "DELETE",
    url: "/deleteSaved/" + thisId
  })
  location.reload();
})
// this will open the comment modal and start the process of CRUD
$(document).on("click", ".commentButton", function () {

  $("#populateNotes").empty();
  // Empty the notes from the note section
  $("#notes").val("");

  $("#savenote").removeAttr("data-id");
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  $("#savenote").attr("data-id", thisId);
  // Now make an ajax call for the Article
  $.ajax({
      method: "GET",
      url: "/notesForArticle/" + thisId
    })
    // With that done, add the note information to the page
    .then(function (data) {
      printNotes(data);
    });
});
// this is thte section that will delete the note from the database and it 
// will repopolate the notes field with the remaining notes data from the database
$(document).on("click", ".delete-button", function () {
  console.log(this);
  // this is the specific notes id
  let thisId = $(this).attr("data-id");
  // this is the article ID
  let noteId = $(this).parent().attr("data-id");
  console.log(thisId);

  // this is where the note is actually getting deleted from the notes database
  $.ajax({
      type: "DELETE",
      url: "/deleteNote/" + thisId,
    })
    // with that done we must reload the modal with all of the remaining notes in the database pertaining to that article
    .then(function (data) {
      console.log(data);
      $.ajax({
        type: "GET",
        url: "/notesForArticle/" + noteId
      }).then(function (data)
        // maybe handlebars would be better for this section but nobody's perfect
        {
          $("#populateNotes").empty();
          if (data) {
            printNotes(data);
          }
        })
    })
})
// this will simply empty the loaded notes area and then put the note into the input fields
$(document).on("click", ".editNote", function () {


  let id = $(this).attr("data-id")
  console.log(id);

  let title = $("#savedNoteTitle").text();
  let body = $("#noteBody").text();

  $("#noteTitle").val(title);
  $("#notes").val(body);
  $("#populateNotes").empty();
  $("#savedNoteTitle").text("");
  $("#noteBody").text("");

  $("#savenote").addClass("hide");
  $("#updateNote").removeClass("hide");
  $("#updateNote").attr("data-id", id);
})
// gives functionality to the edit note button and will actually update in the database instead of deleting
// there is an opurtunity to optimize this a bit but isnt entirely neccessary with the scale of this application
$(document).on("click", "#updateNote", function () {
  let id = $(this).attr("data-id");
  let title = $("#noteTitle").val();
  let body = $("#notes").val();
  let newNote = {
    "title": title,
    "body": body
  }
  console.log(newNote);
  console.log(id);

  $.ajax({
    type: "PUT",
    url: "/updateNote/" + id,
    data: newNote
  }).then(function (result) {

    let data = {
      "note": result
    }
    $("#notes").val("");
    $("#noteTitle").val("");
    $("#noteBody").text("");
    $("#updateNote").addClass("hide");
    $("#savenote").removeClass("hide");
    printNotes(data);
  })

})
// this is labeld as save note but it should truly be add note to provide for the nice to have of being able to add multiple notes
$(document).on("click", "#savenote", function () {
  // This is storing the id of the Article
  let thisId = $(this).attr("data-id");
  let note = $("#notes").val();
  let title = $("#noteTitle").val();

  // This ajax call does two things
  // 1. it will post the note to the notes DB with a unique object id 
  // 2. It will take that unique notes id and put it into the corresponding Article
  // this is why it is neccesary to pass in the ARticle id as the argument and the note as the data
  $.ajax({
      method: "POST",
      url: "/saveArticleNotes/" + thisId,
      data: {
        title: title,
        body: note
      }
    })
    // With that done
    .then(function (data) {
      let articleId = data._id;
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").val("");
      $("#noteTitle").val("");
      $.ajax({
        type: "GET",
        url: "/notesForArticle/" + articleId
      }).then(function (data)
        // maybe handlebars would be better for this section but nobody's perfect
        {
          $("#populateNotes").empty();
          if (data) {
            printNotes(data);
          }
        })
    });
})