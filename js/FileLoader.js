FileLoader = function ( editor ) {
    
    this.FLOWFILENAME  = 'sf_tap_fw_flow.txt';
    this.EDGEFILENAME = 'SiouxFalls_net3.txt';
    this.NODEFILENAME = 'SiouxFalls_node.txt'; 
    this.TRIPFILENAME = 'SiouxFalls_trips.txt';
    var scope = this;
    var signals = editor.signals;
    var reader = this.reader = new FileReader();


};


FileLoader.prototype = {


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
                   // console.log(JSON.stringify(fileData));
                    checkCompete();
				});
                zip.files[scope.EDGEFILENAME].async('string').then(function (fileData) {
                    dataDict.edges = fileData;
                    count += 1;
                    //console.log(JSON.stringify(fileData));
                    checkCompete();
                });

                zip.files[scope.FLOWFILENAME].async('string').then(function (fileData) {
                    dataDict.flows = fileData;
                    count += 1;
                    //console.log(JSON.stringify(fileData));
                    checkCompete();
                });

                zip.files[scope.TRIPFILENAME].async('string').then(function (fileData) {
                    dataDict.trips = fileData;
                    count += 1;
                    //console.log(JSON.stringify(fileData));
                    checkCompete();
                });
                
            });
            function checkCompete (){
                if(count == 4 ) {

                    console.log(dataDict);
                    editor.networkVisualization.readGraphFromString(dataDict);
                }
            }
        }, false );
        scope.reader.readAsBinaryString( file );
    }

};