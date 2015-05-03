$(document).ready(function(){
  var columns = [];
  var columnsEl = $("#columns .table tbody");
  var columnsModalEl = $("#columnsModal");              
  var columnNameEl = $("#columnName");
  var columnTypeEl = $("#columnType");
  var columnsAlertEl = $("#columnsAlert");  
  var json = {};      
  
  var renderColumns = function(){        
    columnsEl.empty();
    $.each(columns, function(k, v){
      var row = $("<tr>");
      var nameCol = $("<td>");
      var typeCol = $("<td>");
      
      nameCol.html(v.name);
      typeCol.html(v.type.text);            
      row.append(nameCol);
      row.append(typeCol);            
      columnsEl.append(row);
    });
    
    // first value, show the table
    if (!isEmpty(columns) && columns.length == 1){
      $("#columns").removeClass("hidden").hide().fadeIn();
      $("#generate").removeClass("hidden").hide().fadeIn();        
    }          
  };
  
  var generate = function(){
    // get root name
    var rootName = $("#rootName").val();
    if (isEmpty(rootName))
      rootName = "root";    
    json[rootName] = [];                    
    
    // loop for the number of rows specified
    var rowCount = $("#rowCount").val();
    if (isNaN(rowCount))
      rowCount = 50;
    for (var i=0; i<rowCount; i++){
    
      var columnJson = {};
      // loop through columns
      $.each(columns, function(k,column){
        // check specific types here
        if (column.type.value == ""){
        
        } else {
          columnJson[column.name] = getRandomHtmlContent();          
        }                        
      });
    
      json[rootName].push(columnJson);                                              
    } 
    
    // check output type
    // if json
    if (output == 1){
      return JSON.stringify(json, null, 2);
    } else {
      return renderOutput();
    }
  };
  
  var renderOutput(){
    // loop through the produced json, and render it to the page
    var jsonArray = json[rootName];
    for (var i=0; i < jsonArray.length; i++){
      
    }
  };
  
  var addColumn = function(event){
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
  };
  
  $("#addColumnForm").on("submit", addColumn);
  
  $("#generate").on("click", function(e){
    $("#results").html("<pre>" + generate() + "</pre>");
    $("#results").removeClass("hidden").hide().fadeIn();    
    $("#download").removeClass("hidden").hide().fadeIn();    
  });
  
  $("#download").on("click", function(e){          
    download("data:application/json;," + generate(), $("#rootName").val() + ".json", "application/json");
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
});

// utilities
function isEmpty(val){
  if (val instanceof String){
    return !($.trim(val));
  } else {
    return $.isEmptyObject(val);
  }
}

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
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
      var chosen = chance.integer({min: 0, max: words.length});
      $.each(words, function(i, word){
        if (!word.contains("<") && i == chosen){
          word = "<a href='" + chance.url() + "'>" + word + "</a>";
        }
      });
      return words.join(" ");
    }
    return html;
  };
  
  return generate();  
}