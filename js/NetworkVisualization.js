var NetworkVisualization = function ( editor, font, viewport ) {
    this.editor = editor;
    var scene = this.scene = editor.scene;
    this.signals = editor.signals;
    //console.log(viewport);
    this.objects = viewport.objects;
    this.graph = editor.graph;
   // this.texture = texture;
    this.readNodes();


    this.nodesContainer = editor.nodesContainer;
    this.edgesContainer = editor.edgesContainer;
    this.flowsContainer = editor.flowsContainer;
    this.setPathVisible( this.flowsContainer, false );
    this.tripsContainer = editor.tripsContainer;
    this.setPathVisible( this.tripsContainer, false );

    this.unitZVector = new THREE.Vector3( 0, 0, 1 );

    var scope = this;

    //console.log(signals)
    this.signals.networkElementDisplayChanged.add( function ( type, show ) {
        if (type == 0 )  scope.setPathVisible(scope.edgesContainer, show);
        if (type == 1 )  scope.setPathVisible(scope.flowsContainer, show);
        if (type == 2 )  scope.setPathVisible(scope.tripsContainer, show);
		scope.signals.rendererChanged.dispatch();

	} );

    this.signals.addNewEdge.add(function(nodePairs){
      
        var startNode = nodePairs[0].graphElement;
        var endNode = nodePairs[1].graphElement;
        var edgeObject = scope.renderEdge(startNode, endNode, 0xff0000, 0.3,4000);
        scope.editor.addNewEdgeMode = 0;
        var edge =  scope.graph.createEdge(startNode.id, endNode.id, 0.3,25900.20064, 6, 6, 0.15, 4, 0, 0, 1);
        console.log(edgeObject);
        edgeObject.graphElement = edge;
        startNode.outgoingEdges.push(edgeObject);
        endNode.incomingEdges.push(edgeObject);
        scope.editor.execute( new AddEdgeCommand(edgeObject));
        //scope.signals.rendererChanged.dispatch();
    });

    this.signals.addNewNode.add( function(){
           
        // create new node object
        var nodeName = 'N'+Config.newNodeCount;
        var geometry = new THREE.PlaneGeometry( 3, 3 );
		var material = new THREE.MeshBasicMaterial( {color: Config.newNodeColor, transparent: true, opacity: 1, map: Config.nodeTexture, alphaTest: 0.2} );
		var nodeObject = new THREE.Mesh( geometry, material );
		var position = editor.camera.position.clone();
		nodeObject.position.set(position.x,position.y,0);
    
        nodeObject.name = 'node';
        nodeObject.type = '0';
        var nodeID = new THREE.TextSprite({
            textSize: 1.5,
            redrawInterval: 0,
            texture: {
            text: nodeName,
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

        // create a node data structue
        var newNode = scope.graph.createNode(nodeName,new THREE.Vector2( nodeObject.position.x, nodeObject.position.y), new THREE.Vector2(convertCoordinate(nodeObject.position.x),convertCoordinate(nodeObject.position.y) ));
        nodeObject.graphElement = newNode;
        console.log(nodeObject)


        scope.editor.execute( new AddNodeCommand(nodeObject)); 


    });
    this.signals.showLabelsChanged.add( function ( show ) {
        
        scope.setLabelsVisible(scope.edgesContainer, show);
		scope.signals.rendererChanged.dispatch();

    } );
    this.signals.updateEdges.add( function ( node ) {
 
        var outgoingEdges = [];
        var incomingEdges = [];        
        var id = node.graphElement.id;
        for( var edge of scope.edgesContainer.children) {
            if(edge.from == id) outgoingEdges.push(edge);
            if(edge.to == id) incomingEdges.push(edge);
        }
        node.graphElement.outgoingEdges = outgoingEdges;
        node.graphElement.incomingEdges = incomingEdges;
        // console.log('hahah',outgoingEdges);
        // console.log('hahah',incomingEdges);
    } );
    
    this.signals.nodePositionChanging.add( function ( node ) {
        var nodePosition;
        var incomingEdges;
        var outgoingEdges;
        if (node.graphElement != undefined ){
            outgoingEdges = node.graphElement.outgoingEdges;
            incomingEdges = node.graphElement.incomingEdges;
            nodePosition = node.position;
        }else{
            outgoingEdges = node.outgoingEdges;
            incomingEdges = node.incomingEdges;
            nodePosition = new THREE.Vector3(node.coordinate.x,node.coordinate.y,0)
        }
        
        
        for( var edge of outgoingEdges ) {
            scope.changeEdgePosition( edge, nodePosition, 1 );
        }
        for( var edge of incomingEdges ) {
            scope.changeEdgePosition( edge, nodePosition, 0 );
        }
        scope.signals.rendererChanged.dispatch( );
    } 
    );
};

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
                scope.graph.createAndAddNode(line[0]);
                scope.graph.setNodeOrignalCoordinate(line[0], new THREE.Vector2( x, y ) );
            }
        
            Config.coordinateMean = Config.coordinateMean / len;
            min -= Config.coordinateMean;
            max -= Config.coordinateMean;
            Config.coordinateRange = Math.max(Math.abs(min), Math.abs(max));

        // console.log((1/25*scope.coordinateRange)+mean)
        // console.log(scope.coordinateRange)
            for ( let [key, node] of Object.entries(  scope.graph.nodes ) ) {
               
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
                i += 1;
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
     
                scope.graph.createAndAddEdge( line[1], line[2], lineWidth, line[3], line[4], line[5], line[6], line[7], line[8], line[9], line[10] );
                
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
                    i += 1;
                    break;
                }
                i += 1;
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

                var r = volume/maxVolume*255;
                var g = 255 - volume/maxVolume*255;
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
            console.log(maxVolume);
            var range = maxVolume-minVolume;
          
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

            scope.renderGraph( );

        })
    },


    renderGraph : function ( ) {
        console.log(this.edgesContainer)
        for ( let [key,node] of Object.entries(this.graph.nodes) ) {
           
            this.renderNode( node );
            this.renderEdges( node );
            this.renderFlows( node );
            this.renderTrips( node );
            
        }   

        //this.setLabelsVisible(this.edgesContainer, false );
        console.log(this.graph)
        this.signals.rendererChanged.dispatch();
    },

    renderNode : function ( node ) {

        var geometry = new THREE.PlaneGeometry( 3, 3 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1, map: Config.nodeTexture, alphaTest: 0.2} );
        var nodeObject = new THREE.Mesh( geometry, material );
        nodeObject.position.set(node.coordinate.x,node.coordinate.y, 0 );
        this.nodesContainer.add(nodeObject);  

        var nodeID = new THREE.TextSprite({
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

    changeEdgePosition : function( edge, position, isStart ) {

        var startPos;
        var endPos;
        if ( isStart == 1 ) {
            startPos = position.clone();
            endPos = new THREE.Vector3(this.graph.nodes[edge.to].coordinate.x, this.graph.nodes[edge.to].coordinate.y, 0 );
        }
        else{
          

            startPos = new THREE.Vector3(this.graph.nodes[edge.from].coordinate.x, this.graph.nodes[edge.from].coordinate.y, 0 );
            endPos = position.clone();
        }
       
        var arrowDirection = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
        var perpendicularVector = this.getPerpendicularVector(arrowDirection);
        endPos.addVectors( endPos, perpendicularVector );
        startPos.addVectors( startPos, perpendicularVector );

        startPos.addVectors(startPos,arrowDirection );
        endPos.subVectors(endPos,arrowDirection );

        var geometry = new THREE.Geometry();
        geometry.vertices.push( startPos );
        geometry.vertices.push( endPos );

        var line = new MeshLine();

        line.setGeometry( geometry );
    

        var arrow = edge.children[0];
        arrow.setDirection(arrowDirection);
           var arrowPosition = new THREE.Vector3().addVectors( startPos, endPos ).divideScalar(2);
        arrow.position.set(arrowPosition.x, arrowPosition.y,0);
        edge.geometry.dispose();
      
        edge.geometry = line.geometry;
        // edge.updateMatrixWorld(true);
        //     edgeObject.name = 'edge';
        //   this.edgesContainer.add(edgeObject);
         
        // positionArray[0] = startPos.x;
        // positionArray[1] = startPos.y;
        // positionArray[3] = endPos.x;
        // positionArray[4] = endPos.y;
        // for ( var attri of Object.keys(edge.geometry.attributes)){
        //     edge.geometry.attributes[attri].array = line.geometry.attributes[attri].array;
        //     edge.geometry.attributes[attri].needsUpdate = true;
        // }

        //positionAttribute.needsUpdate = true;
        // edge.geometry.computeFaceNormals();
        // edge.geometry.computeVertexNormals();
        // edge.geometry.normalsNeedUpdate = true;
        // edge.geometry.verticesNeedUpdate = true;
        // edge.geometry.dynamic = true;
        //console.log(edge.geometry.vertices)

    },

    getPerpendicularVector : function( vector ){

        return vector.clone().applyAxisAngle(this.unitZVector, Math.PI/2).divideScalar(2);
    },
    renderEdges: function ( node ) {
        
        for( let key of Object.keys( node.edges )) {

            var edgeObject = this.renderEdge(node,this.graph.nodes[key],0x0000ff, node.edges[key].lineWidth, node.edges[key].capacity );
  
            this.edgesContainer.add(edgeObject);
            this.objects.push(edgeObject);
            node.outgoingEdges.push(edgeObject);
            this.graph.nodes[key].incomingEdges.push(edgeObject);

        }

    },

    renderEdge: function ( startNode ,endNode, color, lineWidth, capacity ) {
        var key = endNode.id;
        // init start and end position of edge and create edge
        var startPos = new THREE.Vector3( startNode.coordinate.x, startNode.coordinate.y, 0 );
        var endPos = new THREE.Vector3( endNode.coordinate.x, endNode.coordinate.y, 0 );
    
        // transfer the line along the perpendicular vector position and arrow direction
        var arrowDirection = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
        var perpendicularVector = this.getPerpendicularVector(arrowDirection);
        endPos.addVectors( endPos, perpendicularVector );
        startPos.addVectors( startPos, perpendicularVector );
        startPos.addVectors(startPos,arrowDirection );
        endPos.subVectors(endPos,arrowDirection );

        var geometry = new THREE.Geometry();
        geometry.vertices.push( startPos );
        geometry.vertices.push( endPos );
   
        var line = new MeshLine();
        line.setGeometry( geometry );
        var lineColor = new THREE.Color(color);
        var material = new MeshLineMaterial({color:lineColor,sizeAttenuation:true,lineWidth:lineWidth, transparent:true, opacity:0.5});
    
        var edgeObject = new THREE.MeshLine(line.geometry, material);
        edgeObject.color = lineColor;
        edgeObject.name = 'edge';
  

        // add arrow to indicate the direction
        var arrow = this.renderArrow( arrowDirection, startPos, endPos ); 
        edgeObject.center = arrow.position.clone();
        edgeObject.add(arrow);
        // add label to indicate the capcity
        // var capcityLabel = this.renderPathLabel( startPos, endPos, perpendicularVector, capacity, 'capcity' );
        // edgeObject.add(capcityLabel);
        edgeObject.type = 0;
        edgeObject.graphElement = startNode.edges[key];
        edgeObject.from = startNode.id;
        edgeObject.to = key;
        return edgeObject;

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
    return (coor/25*Config.coordinateRange+Config.coordinateMean);

}

function inverseToRealCoordinate( coor ) {
    return round2Dec( ( coor -Config.coordinateMean )/Config.coordinateRange*25 );

}




