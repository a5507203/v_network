function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function httpPostAsync(theUrl, jsonObject, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    };
  
    xmlHttp.send(JSON.stringify(jsonObject));
}

function httpDeleteAsync(theUrl, jsonObject, callback) {
    var xmlHttp = new XMLHttpRequest();
    
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    };
    xmlHttp.open("DELETE", theUrl, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(jsonObject));
}