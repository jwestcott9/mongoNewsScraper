// Grab the articles as a json
getArticles();

function getArticles() {
  $("#articles").empty();
  $.getJSON("/articles", function (data) {

    // For each one
    for (var i = 0; i < data.length; i++) {
      console.log(data[i]._id);
      // Display the apropos information on the page
      $("#articles").append(
        ` <div class = "container">
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
      <button class= "saveButton btn btn-primary" data-id="${data[i]._id}"> Save </button>
      </div>
      </div>
    
   
    <p class ="publishedData">${data[i].publishedBy} ${data[i].datePublished}</p>
  </div>
</div>
</div>`
      )

    }
    $("#loadMe").modal("hide");

  });
}

$(document).on("click", ".saveButton", function () {

  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/savedArticles/" + thisId
    })
    .then(function (data) {
      console.log(data);
    })
})



$(document).on("click", "#scrapeCurrent", function () {
  $("#loadMe").modal({
    backdrop: "static", //remove ability to close modal with click
    keyboard: false, //remove option to close with keyboard
    show: true //Display loader!
  });

  $.ajax({
    type: "GET",
    url: "/scrape/"
  }).then(function (data) {
    console.log(data);
    getArticles();

  })
})


$(document).on("click", "#clearCurrent", function () {


  $.ajax({
    type: "DELETE",
    url: "/deleteAllArticles/"
  }).then(function (data) {
    console.log(data);
    console.log("deleted data")

    location.reload();

  })
})