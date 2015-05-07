var columns = [];
var columnsEl;
var columnsModalEl;              
var columnNameEl;
var columnTypeEl;
var columnsAlertEl;

var json, html;

$(document).ready(function(){  
  // testing
  columns = [
    {type: {"value": 1, "text": "text"}, name: "Column 1"}
  ];  
  
  columnsEl = $("#columns .table tbody");
  columnsModalEl = $("#columnsModal");              
  columnNameEl = $("#columnName");
  columnTypeEl = $("#columnType");
  columnsAlertEl = $("#columnsAlert");  
  
  $("#addColumnForm").on("submit", addColumn);
  
  $("#generate").on("click", function(e){
    $("#results .body").html("Your data is ready to download. You can also preview the data first.");
    $("#results").removeClass("hidden").hide();    
    $("#progress").removeClass("hidden").hide().fadeIn();
    
    // triny parallel
    var p = new Parallel({}, { 
      evalPath: "bower_components/paralleljs/lib/eval.js",
      env: {
        rootName: getRootName(),
        rowCount: getRowCount(),
        columns: columns
      }
    }).require(
        isEmpty, 
        htmlEncode,
        getRandomHtmlContent,
        "/bower_components/chance/chance.js"
    ).spawn(generate).then(
      function(data){
        json = data;
        $("#progress").removeClass("hidden").hide().fadeOut(function(){
          $("#results").removeClass("hidden").hide().fadeIn();
        }); 
      },
      function(err){
        console.log(err);
        console.log(err.message);
      }
    );
  });
  
  $("#download .asJson").on("click", function(e){          
    download("data:application/json;," + json, getRootName() + ".json", "application/json", 
    function(){
      $("#progress").removeClass("hidden").fadeIn();
    },
    function(){
      $("#progress").fadeOut();
    });
  });
  
  $("#download .asHtml").on("click", function(e){
    if (html == null)
      html = renderHtml();
    download("data:application/html;," + html, getRootName() + ".html", "application/html", 
    function(){
      $("#progress").removeClass("hidden").fadeIn();
    },
    function(){
      $("#progress").fadeOut();
    });
  });
  
  $("#preview .asJson").on("click", function(){
    $("#results .body").html("<pre>" + JSON.stringify(json, null, 2) + "</pre>");   
  });
  
  $("#preview .asHtml").on("click", function(){
    if (html == null)
      html = renderHtml();    
    $("#results .body").html(html);
  });
  
  // columns modal events
  columnsModalEl.on('show.bs.modal', function () {
    columnsAlertEl.addClass("hidden");
    // clear previous values
    columnNameEl.val("");
    columnTypeEl.val("");
  });
  
  columnsModalEl.on('shown.bs.modal', function () {
    columnTypeEl.focus();
  });
  
  columnsModalEl.on('hidden.bs.modal', function () {
    renderColumns();
  });  
  
  // testing
  renderColumns();
});

// main functions
function generate(){
  var json = {};
  var rootName = global.env.rootName;
  var rowCount = global.env.rowCount;
  var columns = global.env.columns;

  // get root name
  if (isEmpty(rootName))
    rootName = "root"; 
  json[rootName] = [];                    

  // loop for the number of rows specified
  if (isEmpty(rowCount) || isNaN(rowCount))
    rowCount = 50;
  
  for (var i=0; i < rowCount; i++){    
    var columnJson = {};
    var columnCount = columns.length;
    // loop through columns
    for (var j=0; j<columnCount; j++){
      var column = columns[j];
      
      // 30% chance to be a null value
      if (Math.random() < 0.3){
        columnJson[column.name] = null;
      } else {
        // check specific types here
        if (column.type.value == ""){
  
        } else {
          columnJson[column.name] = getRandomHtmlContent();          
        }                        
      }          
    }
    json[rootName].push(columnJson);
  }
  return json;
}

function renderHtml(){
  // loop through the produced json, and render it to the page
  var jsonArray = json[getRootName()];
    
  var html = "<dl class='dl-horizontal'>";
  for (var i=0; i < jsonArray.length; i++){
    var record = jsonArray[i];
    var columns = Object.keys(record);
    var columnCount = columns.length;
    for (var j=0; j<columnCount; j++){
      var columnName = columns[j];
      html += "<dh>" + columnName + "</dh>";
      html += "<dd>" + htmlDecode(record[columnName]) + "</dd>";
    }
    html += "</dl>";
  }
  return html;
};

function renderColumns(){        
  columnsEl.empty();
  var columnCount = columns.length;
  for (var i = 0; i < columnCount; i++){
    var column = columns[i];
    
    var row = $("<tr>");
    var nameCol = $("<td>");
    var typeCol = $("<td>");
    
    nameCol.html(column.name);
    typeCol.html(column.type.text);            
    row.append(nameCol);
    row.append(typeCol);            
    columnsEl.append(row);
  }
  
  // first value, show the table
  if (!isEmpty(columns) && columns.length == 1){
    $("#columns").removeClass("hidden").hide().fadeIn();
    $("#generate").removeClass("hidden").hide().fadeIn();        
  }          
}

function addColumn(event){
  var columnData = {};
  columnData.name = columnNameEl.val();
  columnData.type = {"value" : columnTypeEl.val(), "text" : columnTypeEl.children("option:selected").text()};
  
  // TODO: validate data
  if ((!isEmpty(columnData.name)) || (!isEmpty(columnData.name))){
    columns.push(columnData);
    columnsAlertEl.hide();
    columnsModalEl.modal('hide');            
  } else {
    columnsAlertEl.removeClass("hidden").hide().fadeIn();
  }
  event.preventDefault();
}

function getRootName(){
  return $("#rootName").val() || "root";
}

function getRowCount(){
  return $("#rowCount").val() || 50;
}

// utilities
function isEmpty(val){
  if (val == null || !val)
    return true
    
  if (val instanceof String){
    return (val.trim() == "")
  }
  return false
}

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return String(value)
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}

function htmlDecode(html){
  var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
}

function getRandomHtmlContent(){
  var generate = function(){
    // we want to generate some random html content
    // lets define some possible templates
  
    // 1
    // <p>
    // Paragraph containing a random number of paragraphs (between 2 and 5)
  
    // 2
    // <ul>
    // Unordered list, with a random number of list items (between 2 and 5)
  
    // 3
    // <ol>
    // Ordered list, with a random number of list items (between 2 and 5)
  
    // 4
    // <ul>
    // Description list, with a random number of list items (between 2 and 5)
    // Random number of words for the heading (between 1 and 5)
    // One paragraph for the description, with between 1 and 3 sentances
  
    var numberOfElements = chance.integer({min: 5, max: 30});
    var html = "";
    
    // iterators
    var a = 0;
    var b = 0;    
    
    for (a = 0; a < numberOfElements; a++){
      var elementHtml;
      switch (chance.integer({min: 1, max: 4})) {
      case 1:
        elementHtml = "<p>" + getParagraph() + "</p>";
        break;
      case 2:
        elementHtml = "<ul>";
        for (b = 0; b < chance.integer({min: 2, max: 5}); b++){
          elementHtml += "<li>" + getSentance() + "</li>";
        }
        elementHtml += "</ul>";
        break;
      case 3:
        elementHtml = "<ol>";
        for (b = 0; b < chance.integer({min: 2, max: 5}); b++){
          elementHtml += "<li>" + getSentance() + "</li>";
        }
        elementHtml += "</ol>";
        break;
      case 4:
        elementHtml = "<dl>";
        for (b = 0; b < chance.integer({min: 2, max: 5}); b++){
          elementHtml += "<dt>" + getSentance() + "</dt>";
          elementHtml += "<dd>" + getParagraph() + "</dd>";  
        }
        elementHtml += "</dl>";
        break;
      }
    
      html += elementHtml;
    }
    
    return htmlEncode(html);
  };
  
  var getParagraph = function(){
    return injectUrl(chance.paragraph({sentences: chance.integer({min: 2, max: 5}) }));
  };
  
  var getSentance = function(){
    return injectUrl(chance.sentence({words: chance.integer({min: 3, max: 10})}));
  };
  
  var injectUrl = function(html){
    if (Math.random() < 0.15){
      // 15% of the time, inject a url in the html
      // go through each word, and randomly choose one and wrap it in an <a> tag, with a random url
      var words = html.split(" ");
      var wordCount = words.length;
      var chosen = chance.integer({min: 0, max: wordCount});
      for (var i=0; i < wordCount; i++){
        var word = words[i];
        if (word.indexOf("<") > -1){
          // if this is an html tag, move onto the next word
          chosen++;
        } else {
          if (i == chosen){
            word = "<a href='" + chance.url() + "'>" + word + "</a>";
          }
        }        
      }
      return words.join(" ");
    }
    return html;
  };
  
  return generate();  
}