FileLoader = function ( editor ) {
    
    this.FLOWFILENAME  = 'flows.csv';
    this.EDGEFILENAME = 'networks.csv';
    this.NODEFILENAME = 'nodes.csv'; 
    this.TRIPFILENAME = 'trips.csv';
    this.GAMEINFOFILENAME = 'gameInfo.csv';
    this.ROADTYPEFILENAME = 'roadTypes.csv';
    var scope = this;
    var signals = this.signals = editor.signals;
    var reader = this.reader = new FileReader();


    signals.loadDataUrl.add(function( url ){
        scope.loadDataUrl( url ); 
    });

    // signals.loadSavedProgress.add(function( url ){
    //     scope.loadSavedProgress( url ); 
    // });
};

FileLoader.prototype = {

    // load a zip folder
    loadFile: function( file ){
        var scope = this;
        // if (editor.currGame !='')

        
        var startReading = function(){
            console.log('start');

            var load = function ( event ) {	
                var contents = event.target.result;
                var count = 0;
                var zip = new JSZip( );
                var dataDict = {};
                var roadTypeFile = false;
                zip.loadAsync(contents).then(function (zip) {

                    if(!zip.files[scope.NODEFILENAME] ){
                        checkCompete('can not find nodes.csv');
                    }
                    else{
                        zip.files[scope.NODEFILENAME].async('string').then(function (fileData) {
                            dataDict.nodes = fileData;
                            count += 1;
                            checkCompete();
                        });
                    }


                    if(!zip.files[scope.EDGEFILENAME] ){
                        checkCompete('can not find networks.csv');
                    }
                    else{
                        zip.files[scope.EDGEFILENAME].async('string').then(function (fileData) {
                            dataDict.edges = fileData;
                            count += 1;
                            checkCompete();
                        });
                    }

                    // if(!zip.files[scope.FLOWFILENAME] ){
                    //     count += 1;
                    // }
                    // else{
                    //     zip.files[scope.FLOWFILENAME].async('string').then(function (fileData) {
                    //         dataDict.flows = fileData;
                    //         count += 1;
                    //         checkCompete();
                    //     });
                    // }



                    if(!zip.files[scope.TRIPFILENAME] ){
                        checkCompete('can not find trips.csv');
                    }else{
                        zip.files[scope.TRIPFILENAME].async('string').then(function (fileData) {
                            dataDict.trips = fileData;
                            count += 1;
                            checkCompete();
                        });
                    }


                    if(!zip.files[scope.ROADTYPEFILENAME] ){
                        checkCompete('can not find roadTypes.csv');
                    }else{
                        roadTypeFile = true;
                        zip.files[scope.ROADTYPEFILENAME].async('string').then(function (fileData) {
                            dataDict.roadTypes = fileData;
                            count += 1;
                            checkCompete();
                        });
                    }
                    

                    if(!zip.files[scope.GAMEINFOFILENAME]){
                        count += 1;
                    }else{
                        zip.files[scope.GAMEINFOFILENAME].async('string').then(function (fileData) {
                            if(fileData != '') scope.signals.loadGameName.dispatch(fileData);
                            count += 1;
                            checkCompete();
                        });
                    }
                });


                scope.signals.loadGameName.add(function(currGame){
                    if(roadTypeFile == true) return;    
                    httpGetAsync(Config.host+'/networks/'+currGame, function(network){
                        dataDict.roadTypes = network.roadTypes;
                        count += 1;
                        checkCompete();
                    
                    });

                });
                function checkCompete (error){
                    if( error) {alert(error);signals.editor.clear.dispatch();}

                    if(count == 5) {
                        //console.log(dataDict);
                        editor.networkVisualization.readGraphFromString(dataDict);
                    }
                }
                scope.reader.removeEventListener( 'load', load, false );
            };
            scope.reader.addEventListener( 'load', load, false );
            scope.reader.readAsBinaryString( file );
          
            scope.signals.editorCleared.remove(startReading);
        };
        // scope.signals.editorCleared.remove(load);
    
        scope.signals.editorCleared.add(startReading);
        scope.signals.clear.dispatch();

    },

    //load from api call
    loadDataUrl: function( url ){
        var scope = this;
        httpGetAsync(url, function(network){
           console.log(network);
            var dataDict = {};
            dataDict.nodes = network.nodes;
            dataDict.edges = network.links;
            dataDict.flows = network.flows;
        
            dataDict.trips = network.trips;
            dataDict.roadTypes = network.roadTypes;
            editor.linkAddable = network.linkAddedable;
            editor.nodeMoveable = network.nodeMoveable;

            scope.signals.edgeNodeOption.dispatch(network.linkAddedable, network.nodeMoveable); 
            editor.networkVisualization.readGraphFromString(dataDict);
	
        });
    },

    loadSavedProgress: function( network ){

            this.signals.edgeNodeOption.dispatch(network.linkAddedable, network.nodeMoveable); 
            this.signals.loadGameName.dispatch(network.currGame);
            editor.networkVisualization.readGraphFromString(network);
    }

};


