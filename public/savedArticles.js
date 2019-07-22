$.getJSON("/getSavedArticles", function(data) {
    console.log(data)
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#savedArticles").append( 
       `<div class = "container">
        <div class="card articleFeed" data-id = "${data[i]._id}">
  <h5 class="card-header" >${data[i].title}</h5>
  <div class="card-body" data-id = "${data[i]._id}">
    <a class="card-text" href="${data[i].link}" target = "_blank"> ${data[i].link}</a><br/>
    <button  class="btn btn-primary commentButton"  data-toggle = "modal" data-target="#exampleModalLong">Article Notes</button>
    <button class = "deleteArticle btn btn-danger" > Delete </button>
  </div>
</div>
</div>`
  
      );
    }
  });


  $(document).on("click", "#clearSaved", function(){
    $.ajax({
      type:"DELETE",
      url:"/clearSavedArticles"
    }).then(()=>
      location.reload()
    )
  })
  $(document).on("click", ".deleteArticle", function(){
    let thisId = $(this).parent().attr("data-id");
    
    $.ajax({
      type:"DELETE",
      url:"/deleteSaved/" + thisId
    })
    location.reload();
  })
  

$(document).on("click", ".commentButton", function() {
  
  $("#populateNotes").empty();
    // Empty the notes from the note section
    $("#notes").val("");

    $("#savenote").removeAttr("data-id");
    // Save the id from the p tag
    var thisId = $(this).parent().attr("data-id");
    $("#savenote").attr("data-id", thisId);
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/notesForArticle/" + thisId
    })  
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#populateNotes").append("<h5 class = 'topBorder'>"+ data.note.title+"</h5>")
        $("#populateNotes").append("<p class= 'bottomBorder' id = 'noteBody' >" + data.note.body + 
        " <button class = 'btn btn-danger delete-button' id='delete-this-note' >delete note</button> </p>");
        $("#noteBody").attr("data-id", thisId);
        $("#delete-this-note").attr("data-id", data.note._id);
        // If there's a note in the article

        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      })
      
      
      ;
  });


  // this is thte section that will delete the note from the database and it 
  // will repopolate the notes field with the remaining notes data from the database
  $(document).on("click", "#delete-this-note", function(){

    // this is the specific notes id
    let thisId = $(this).attr("data-id");
    // this is the article ID
    let noteId = $(this).parent().attr("data-id");
    console.log(thisId);

    // this is where the note is actually getting deleted from the notes database
    $.ajax({
      type: "DELETE",
      url: "/deleteNote/" +thisId,
    })
    // with that done we must reload the modal with all of the remaining notes in the database pertaining to that article
    .then(function(data){
      console.log(data);
      $.ajax({
        type:"GET",
        url: "/notesForArticle/" + noteId
      }).then(function(data)
      // maybe handlebars would be better for this section but nobody's perfect
      {
        $("#populateNotes").empty();
        if(data){
          $("#populateNotes").append("<h5 class = 'topBorder'>"+ data.note.title+"</h5>")
          $("#populateNotes").append("<p class= 'bottomBorder' id = 'noteBody'> " + data.note.body + 
          "</p> <br/><button class = 'btn btn-danger delete-button' id='delete-this-note' >delete note</button> ");
          $("#noteBody").attr("data-id", thisId);
        
          $("#delete-this-note").attr("data-id", data.note._id);
        }
      })
    })
  })


  
$(document).on("click", "#savenote", function()
{
  // This is storing the id of the Article
let thisId = $(this).attr("data-id");
let note = $("#notes").val();
let title =$("#noteTitle").val();

// This ajax call does two things
// 1. it will post the note to the notes DB with a unique object id 
// 2. It will take that unique notes id and put it into the corresponding Article
// this is why it is neccesary to pass in the ARticle id as the argument and the note as the data
$.ajax({
  method:"POST",
  url: "/saveArticleNotes/"+ thisId,
  data: {
    title: title,
    body: note
  }
}) 
// With that done
    .then(function(data) {
      let articleId = data._id;
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").val("");
      $("#noteTitle").val("");
            $.ajax({
        type:"GET",
        url: "/notesForArticle/" + articleId
      }).then(function(data)
      // maybe handlebars would be better for this section but nobody's perfect
      {
        $("#populateNotes").empty();
        if(data){
          $("#populateNotes").append("<h5 class = 'topBorder'>"+ data.note.title+"</h5>")
          $("#populateNotes").append("<p class= 'bottomBorder' id = 'noteBody' >" + data.note.body + 
          " <button class = 'btn btn-danger delete-button' id='delete-this-note' >delete note</button> </p>");
          $("#noteBody").attr("data-id", thisId);
          $("#delete-this-note").attr("data-id", data.note._id);
        }
      })
    });


})