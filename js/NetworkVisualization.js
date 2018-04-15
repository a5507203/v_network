var NetworkVisualization = function ( editor, font, texture, viewport ) {
    this.editor = editor;
    var scene = this.scene = editor.scene;
    this.signals = editor.signals;
    //console.log(viewport);
    this.objects = viewport.objects;
    this.graph = new Graph();
    this.texture = texture;
    this.readNodes();

    this.nodesContainer = new THREE.Group();
    this.nodesContainer.position.set( 0, 0, 0.02 );
    scene.add( this.nodesContainer );

    this.edgesContainer = new THREE.Group();
    this.edgesContainer.position.set( 0, 0, 0.01 );
    scene.add( this.edgesContainer );

    this.flowsContainer = new THREE.Group();
    this.flowsContainer.position.set( 0, 0, 0.02 );
    this.setPathVisible( this.flowsContainer, false );
    scene.add( this.flowsContainer );

    this.tripsContainer = new THREE.Group();
    this.tripsContainer.position.set( 0, 0, 0.02 );
    this.setPathVisible( this.tripsContainer, false );
    scene.add( this.tripsContainer );


    
    this.unitZVector = new THREE.Vector3( 0, 0, 1 );

    var scope = this;

    //console.log(signals)
    this.signals.networkElementDisplayChanged.add( function ( type, show ) {
        if (type == 0 )  scope.setPathVisible(scope.edgesContainer, show);
        if (type == 1 )  scope.setPathVisible(scope.flowsContainer, show);
        if (type == 2 )  scope.setPathVisible(scope.tripsContainer, show);
		scope.signals.rendererChanged.dispatch();

	} );

    
    this.signals.showLabelsChanged.add( function ( show ) {
        
        scope.setLabelsVisible(scope.edgesContainer, show);
		scope.signals.rendererChanged.dispatch();

    } );
    
    
    
}

NetworkVisualization.prototype = {

    readNodes : function( ){

        var scope = this;
        Config.coordinateMean = 0;
        Config.coordinateRange = 0;

        d3.text("dataFile/SiouxFalls_node.txt", function(data) {
    
            //TODO construct graph and normalize coordinate
            var min = Infinity;
            var max = -Infinity;
            var normalizedData = {};
            var len = 0;
            
            var lines = data.split( '\n' );
         
            for ( var i = 1 ; i < lines.length ; i += 1 ) {
                
                var line = lines[i].split( '\t' );
                if( line.length < 4 ) continue;
                
                var x = parseFloat( line[1] );
                var y = parseFloat( line[2] ); 
                Config.coordinateMean += x + y;
                len += 2;

                if ( x < y ) {
                    if ( min > x ) min = x
                    if ( max < y ) max = y
                }
                else {
                    if ( min > y ) min = y
                    if ( max < x ) max = x
                }
                // add node and orginal coordinate data to graph structure
                scope.graph.addNode(line[0]);
                scope.graph.setNodeOrignalCoordinate(line[0], new THREE.Vector2( x, y ) );
            }
        
            Config.coordinateMean = Config.coordinateMean / len;
            min -= Config.coordinateMean;
            max -= Config.coordinateMean;
            Config.coordinateRange = Math.max(Math.abs(min), Math.abs(max));

        // console.log((1/25*scope.coordinateRange)+mean)
        // console.log(scope.coordinateRange)
            for ( let[key, node] of Object.entries(  scope.graph.nodes ) ) {
               
                scope.graph.setNodeCoordinate(key, new THREE.Vector2( inverseToRealCoordinate( node.orginalCoordinate.x) , inverseToRealCoordinate( node.orginalCoordinate.y )) );
            }
    
            var nodesContainer = new THREE.Group();
            scope.readEdges();
            scope.readFlows();
            scope.readTrips();
        })

    },


    // constructNodes:function ( data, graph ) {


    
       
    // },

    readEdges : function (  ) {
        var scope = this;
        var maxCapacity = -Infinity;
        d3.text("dataFile/SiouxFalls_net.txt", function(data) {
            var lines = data.split( '\n' );
            var i = 0;
            
            while ( i < lines.length  ) {
    
                if( lines[i].split('\t')[0] == '~ ' ) {
                    i += 1;
                    break;
                }
                i += 1
            }
            var startIndex = i;
            for ( ; i< lines.length ; i += 1 ) {
                var line = lines[i].split('\t');
                if (line.length < 10 ) continue;
                var capacity = parseFloat(line[3]);
                if( capacity > maxCapacity ) {
                    maxCapacity = capacity;
                }
            }

            for ( i = startIndex ; i< lines.length ; i += 1 ) {
                var line = lines[i].split('\t');
                if (line.length < 10 ) continue;
                // make the largest value to Math.tanh(0.7)
                var lineWidth = Math.round10(Math.tanh(parseFloat(line[3])/(2*maxCapacity)+0.2),-2);
     
                scope.graph.addEdge( line[1], line[2], lineWidth, line[3], line[4], line[5], line[6], line[7], line[8], line[9], line[10] );
                
            }
  
           
        })

     
    },

    readFlows : function (  ) {

        var scope = this;
        var maxVolume= -Infinity;
        d3.text("dataFile/sf_tap_fw_flow.txt", function(data) {
            var lines = data.split( '\n' );
            var i = 0;
           
            while ( i < lines.length  ) {
    
                if( lines[i].split('\t')[0] == '~ ' ) {
                    i += 1
                    break;
                }
                i += 1
            }
            var startIndex = i;
            //find max flow 
            for ( ; i< lines.length ; i += 1 ) {
                var line = lines[i].split('\t');
                if (line.length < 7 ) continue;
                var volume = parseFloat(line[4].replace(' ',''));
               
                if( volume > maxVolume ) {
                    maxVolume = volume;
                }
            }
     
            
            for ( i = startIndex ; i< lines.length ; i += 1 ) {
                var line = lines[i].split('\t');
                if (line.length < 7 ) continue;
                var lineColor = calculateColor(parseFloat(line[4].replace(' ','')),maxVolume);
                scope.graph.addFlow(line[1].replace(' ',''), line[2].replace(' ',''), lineColor, line[4].replace(' ',''),line[5].replace(' ','') );
    
            }


            function calculateColor( volume, maxVolume ) {

                var r = volume/maxVolume*255
                var g = 255 - volume/maxVolume*255
                return rgbToHex(r, g, 0);
                

            }
             
        })
    },


    readTrips : function ( ) {
        var scope = this;
        var maxVolume= -Infinity;
        d3.text("dataFile/SiouxFalls_trips.txt", function(data) {
            //var lines = data.split( 'Origin 	' );


            var volumes = data.replace(/\d+\s+:\s+/g,'').replace(/\w*\s+/g,'').replace(/.*>/g,'').replace(/;$/,'').split(';').map(Number);
            var startNodes = data.replace(/\d+\s+:.*/g,'').replace(/\s+/g,'').replace(/.*>/g,'').replace(/[A-Za-z]+/g,',').replace(/^,/,'').split(',');
            var minVolume = Math.min.apply(Math,volumes);
            var maxVolume = Math.max.apply(Math,volumes);
            var nodesNum = startNodes.length;
            console.log(maxVolume)
            var range = maxVolume-minVolume;
            console.log(volumes[10*16-1])
            for ( var i = 0 ; i < nodesNum ; i += 1 ) {
            
                for ( var j = i+1 ; j < nodesNum ; j += 1 ) {

                   // if ( i == j ) continue;
                    currVol = volumes[i*nodesNum+j];
                    var lineWidth = Math.round10(Math.tanh(currVol/(maxVolume)),-2);
                    if(lineWidth > 0.6) console.log(lineWidth)
                    var opacity = (currVol - minVolume)/(range);
                    scope.graph.addTrip(startNodes[i],startNodes[j],volumes[(i+1)*(j+1)-1],lineWidth,opacity);

                }
             
            }

            console.log(scope.graph)
            scope.renderGraph( );

        })
    },


    renderGraph : function ( ) {

        for ( let [key,node] of Object.entries(this.graph.nodes) ) {
           
            this.renderNode( node );
            this.renderEdges( node );
            this.renderFlows( node );
            this.renderTrips( node );
            
        }   

        this.setLabelsVisible(this.edgesContainer, false );
        this.signals.rendererChanged.dispatch();
    },

    renderNode : function ( node ) {

        var geometry = new THREE.PlaneGeometry( 3, 3 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1, map: this.texture, alphaTest: 0.2} );
        var nodeObject = new THREE.Mesh( geometry, material );
        nodeObject.position.set(node.coordinate.x,node.coordinate.y, 0 );
        this.nodesContainer.add(nodeObject);  

        let nodeID = new THREE.TextSprite({
            textSize: 1.5,
            redrawInterval: 0,
            texture: {
              text: node.id,
              fontFamily: 'Arial',
            },
            material: {
              color: 0xFFFFFF,
              fog: false,
              transparent: true
            },
          });
          nodeID.position.set(0 , 0 , 0 );
          nodeObject.add(nodeID);
          nodeObject.name = 'node';
          nodeObject.type = '0';
          nodeObject.graphElement = node;
          this.objects.push(nodeObject);
          

    },

    renderEdges: function ( node ) {
        
        for( let key of Object.keys( node.edges )) {
  
            // init start and end position of edge
            var startPos = new THREE.Vector3( node.coordinate.x, node.coordinate.y, 0 );
            var endPos = new THREE.Vector3( this.graph.nodes[key].coordinate.x, this.graph.nodes[key].coordinate.y, 0 );
            var arrowDirection = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
            var perpendicularVector = arrowDirection.clone().applyAxisAngle(this.unitZVector, Math.PI/2).divideScalar(2);
            
            // transfer the line along the perpendicular vector position
            endPos.addVectors( endPos, perpendicularVector );
            startPos.addVectors( startPos, perpendicularVector );

            startPos.addVectors(startPos,arrowDirection );
            endPos.subVectors(endPos,arrowDirection );

            var geometry = new THREE.Geometry();
            geometry.vertices.push( startPos );
            geometry.vertices.push( endPos );
            // create a line object to indicate edge
            var line = new MeshLine();

            line.setGeometry( geometry );
            var material = new MeshLineMaterial({color:new THREE.Color(0x0000ff),sizeAttenuation:true,lineWidth:node.edges[key].lineWidth, transparent:true, opacity:0.5});
            var edgeObject = new THREE.MeshLine(line.geometry, material);
            edgeObject.name = 'edge';
         
            // add arrow to indicate the direction
            var arrow = this.renderArrow( arrowDirection, startPos, endPos ); 
            edgeObject.center = arrow.position.clone();
            edgeObject.add(arrow);
            var capcityLabel = this.renderPathLabel( startPos, endPos, perpendicularVector, node.edges[key].capacity, 'capcity' );
        
            edgeObject.add(capcityLabel);
            edgeObject.type = 0;
            edgeObject.graphElement = node.edges[key];
            this.edgesContainer.add(edgeObject);
            this.objects.push(edgeObject);

        }

    },


    renderFlows: function ( node ) {

        for( let key of Object.keys( node.flows )) {
  
            // init start and end position of flow
            var startPos = new THREE.Vector3( node.coordinate.x, node.coordinate.y, 0 );
            var endPos = new THREE.Vector3( this.graph.nodes[key].coordinate.x, this.graph.nodes[key].coordinate.y, 0 );
            var arrowDirection = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
            var perpendicularVector = arrowDirection.clone().applyAxisAngle(this.unitZVector, Math.PI/2).divideScalar(2);
            // transfer the line along the perpendicular vector position
            endPos.addVectors( endPos, perpendicularVector );
            startPos.addVectors( startPos, perpendicularVector );

            var geometry = new THREE.Geometry();
            geometry.vertices.push( startPos );
            geometry.vertices.push( endPos );
            // create a line object to indicate flow
            var line = new MeshLine();
            line.setGeometry( geometry );
            var material = new MeshLineMaterial({color:new THREE.Color(node.flows[key].lineColor),sizeAttenuation:true,lineWidth: node.edges[key].lineWidth, transparent:false, opacity:1});
            var flowsObject = new THREE.Mesh( line.geometry, material );
            //add arrow to indicate the direction
            var arrow = this.renderArrow( arrowDirection, startPos, endPos ); 
            flowsObject.add(arrow);
        
            //var capcityLabel = this.renderPathLabel( startPos, endPos, perpendicularVector, node.edges[key].capacity );
           // flows.add(capcityLabel)
            this.flowsContainer.add(flowsObject);
        }

    },

    renderTrips: function ( node ) {

        for( let [endNode,trips] of Object.entries( node.trips )) {
  
            // init start and end position of trip
            var startPos = new THREE.Vector3( node.coordinate.x, node.coordinate.y, 0 );
            var endPos = new THREE.Vector3( this.graph.nodes[endNode].coordinate.x, this.graph.nodes[endNode].coordinate.y, 0 );

            // console.log(endNode,trips)
            // console.log(startPos,endPos)
            // break
            var geometry = new THREE.Geometry();
            geometry.vertices.push( startPos );
            geometry.vertices.push( endPos );
            // create a line object to indicate trip
            var line = new MeshLine();
            line.setGeometry( geometry );

            var material = new MeshLineMaterial({color:new THREE.Color(0xff0000),sizeAttenuation:true,lineWidth: trips.lineWidth, transparent:true, opacity:trips.opacity});
            var tripsObject = new THREE.Mesh( line.geometry, material );

   
            this.tripsContainer.add(tripsObject);
        }

    },
    renderArrow: function( arrowDirection, startPos, endPos ) {

        var arrowPosition = new THREE.Vector3().addVectors( startPos, endPos ).divideScalar(2);
        var arrow = new THREE.ArrowHelper( arrowDirection, arrowPosition, 0, 0x000000, 1, 1);
        return arrow;
    },


    renderPathLabel: function( startPos, endPos, perpendicularVector, number, name ) {

        let labelText = new THREE.TextSprite({
            textSize: 0.5,
            redrawInterval: 0,
            texture: {
              text: Math.round10( number, -1 ).toString(),
              fontFamily: 'Arial',
            },
            material: {
              color: 0x000000,
              fog: false,
              transparent: true
            },
          });
          
        var labelPosition = new THREE.Vector3().addVectors( startPos, endPos ).divideScalar(2);
        labelPosition = labelPosition.addVectors(labelPosition,perpendicularVector.multiplyScalar(1.6));
        labelText.position.set(labelPosition.x , labelPosition.y , 0 );
        labelText.name = name;
        return labelText;

    },

    setLabelsVisible: function(container, bool){

        for( let child of Object.values( container.children ) ) {
            child.getObjectByName('capcity').visible = bool;
        }

    },

    setPathVisible: function(container, bool){

        container.visible = bool;

    },

}

function round2Dec(num) {

    return Math.round10(parseFloat(num),-2);
    
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function convertCoordinate( coor ) {
    return (coor/25*Config.coordinateRange+Config.coordinateMean)

}

function inverseToRealCoordinate( coor ) {
    return round2Dec( ( coor -Config.coordinateMean )/Config.coordinateRange*25 )

}




