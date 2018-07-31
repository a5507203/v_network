FileLoader = function ( editor ) {
    
    // this.FLOWFILENAME  = 'flows.csv';
    this.EDGEFILENAME = 'networks.csv';
    this.NODEFILENAME = 'nodes.csv'; 
    this.TRIPFILENAME = 'trips.csv';
    var scope = this;
    var signals = this.signals = editor.signals;
    var reader = this.reader = new FileReader();


    signals.loadDataUrl.add(function( url ){
        scope.loadDataUrl( url ); 
    });

};

FileLoader.prototype = {

    // load a zip folder
    loadFile: function( file ){
        var scope = this;
        scope.reader.addEventListener( 'load', function ( event ) {	
            var contents = event.target.result;
            var count = 0;
            var zip = new JSZip( );
            var dataDict = {};
        
            zip.loadAsync(contents).then(function (zip) {
                zip.files[scope.NODEFILENAME].async('string').then(function (fileData) {
                    dataDict.nodes = fileData;
                    count += 1;
                    checkCompete();
				});
                zip.files[scope.EDGEFILENAME].async('string').then(function (fileData) {
                    dataDict.edges = fileData;
                    count += 1;
                    checkCompete();
                });

                // zip.files[scope.FLOWFILENAME].async('string').then(function (fileData) {
                //     dataDict.flows = fileData;
                //     count += 1;
                //     //console.log(JSON.stringify(fileData));
                //     checkCompete();
                // });

                zip.files[scope.TRIPFILENAME].async('string').then(function (fileData) {
                    dataDict.trips = fileData;
                    count += 1;
    
                    checkCompete();
                });
                
            });
            function checkCompete (){
                if(count == 3 ) {
                    console.log(dataDict);
                    editor.networkVisualization.readGraphFromString(dataDict);
                }
            }
        }, false );
        scope.reader.readAsBinaryString( file );
    },

    //load from api call
    loadDataUrl: function( url ){
        var scope = this;
        httpGetAsync(url, function(network){
            var dataDict = {};
            dataDict.nodes = network.nodes;
            dataDict.edges = network.links;
            // dataDict.flows = network.flows;
        
            dataDict.trips = network.trips;
            // console.log(network.flows);
            editor.linkAddedable = network.linkAddedable;
            console.log(dataDict);
            scope.signals.edgeAddedable.dispatch(network.linkAddedable); 
            editor.networkVisualization.readGraphFromString(dataDict);
	
        });
    }

};


