
var NetworkVisualization = function ( editor ) {
    this.editor = editor;
    var scene = this.scene = editor.scene;
    this.signals = editor.signals;

    this.objects = editor.objects;
    this.graph = editor.graph;
 
    this.nodesContainer = editor.nodesContainer;
    this.edgesContainer = editor.edgesContainer;
    this.flowScene = editor.flowScene;
    this.tripScene = editor.tripScene;
    


    this.unitZVector = new THREE.Vector3( 0, 0, 1 );

    var scope = this;
    this.signals.readFlows.add(function(flows){

        scope.graph.cleanFlows();
        scope.readFlowsFromRawDataString(flows);
        scope.renderFlows();
        scope.renderTrips();
        scope.signals.rendererChanged.dispatch();


    });

    this.signals.networkElementDisplayChanged.add( function ( type, show ) {
        if (type == 0 )  scope.setPathVisible(scope.tripScene, show);
        if (type == 1 )  {
            editor.trafficFlow = show;
        }
        if (type == 2 )  {
	        editor.desireLines = show;
            scope.setPathVisible(scope.tripScene, show);
        }
		scope.signals.rendererChanged.dispatch();

	} );

    this.signals.addNewEdge.add(function(nodePairs){
      
        var startNode = nodePairs[0].graphElement;
        var endNode = nodePairs[1].graphElement;
        var currRoadTypeName = Object.keys(Config.roadTypes)[0];
        var currLanes = Config.roadTypes[currRoadTypeName].minLanes;

        var lineWidth = calculateLineWidth(getCapacity(currRoadTypeName,currLanes));
        
        //lineWidth, length, b, power, toll, numberOfLanes, type, modifiedType, modifiedNumberOfLanes, modifiedLength
        var edgeInfo = scope.graph.createEdge(startNode.uuid, endNode.uuid, lineWidth, 0 ,1,1,0,0, 'none',  currRoadTypeName, currLanes, calculateRoadLength(startNode.orginalCoordinate, endNode.orginalCoordinate));
        var edgeObject = scope.createEdgeObject(startNode, endNode, edgeInfo.edge,edgeInfo.scalar, scope.getEdgeColor(edgeInfo.edge.modifiedType),edgeInfo.edge.lineWidth);
        scope.editor.addNewEdgeMode = 0;
  

        // edgeObject.graphElement = edge;
        startNode.outgoingEdges.push(edgeObject);
        endNode.incomingEdges.push(edgeObject);
        scope.editor.execute( new AddEdgeCommand(edgeObject));
       // }
        scope.signals.addNewEdgeEnd.dispatch();
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
        var nodeNameLabel = new THREE.TextSprite({
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
        
        nodeNameLabel.position.set(0 , 0 , 0 );
        nodeObject.add(nodeNameLabel);

        // create a node data structue
        var newNode = scope.graph.createNode(nodeObject.uuid, nodeName, new THREE.Vector2( nodeObject.position.x, nodeObject.position.y), new THREE.Vector2(convertToFileCoordinate(nodeObject.position.x),convertToFileCoordinate(nodeObject.position.y) ));
        nodeObject.graphElement = newNode;
        scope.editor.execute( new AddNodeCommand(nodeObject)); 


    });

    this.signals.showLabelsChanged.add( function ( show ) {
        
        scope.setLabelsVisible(scope.edgesContainer, show);
		scope.signals.rendererChanged.dispatch();

    } );

    this.signals.updateEdgesPosition.add( function ( edge ) {
        var startNode = scope.graph.nodes[edge.from];
        var endNode = scope.graph.nodes[edge.to];
        scope.changeEdgePosition( edge, new THREE.Vector3(startNode.coordinate.x, startNode.coordinate.y, 0 ), new THREE.Vector3(endNode.coordinate.x, endNode.coordinate.y, 0 ),startNode.orginalCoordinate,endNode.orginalCoordinate );
   
    } );
    this.signals.lineTypeChanged.add(function (edge) {
        edge.material.dispose();
        edge.graphElement.lineWidth = calculateLineWidth(getCapacity(edge.graphElement.modifiedType,edge.graphElement.modifiedNumberOfLanes));
        var color;
        if(editor.selected == edge) color = new THREE.Color(0x00ffff);
        else color = scope.getEdgeColor(edge.graphElement.modifiedType);
        edge.material = new MeshLineMaterial({color:color,sizeAttenuation:true,lineWidth:edge.graphElement.lineWidth, transparent:true, opacity:1});
        edge.color = scope.getEdgeColor(edge.graphElement.modifiedType);
        scope.editor.select(edge);
       	scope.signals.refreshSidebarObjectProperties.dispatch( edge );
        scope.signals.rendererChanged.dispatch();

    }),

    // this.signals.lineWidthChanged.add( function ( edge ) {
    //     edge.material.dispose();
    //     edge.material = new MeshLineMaterial({color:Config.lineColor,sizeAttenuation:true,lineWidth:edge.graphElement.lineWidth, transparent:true, opacity:0.5});
    //     scope.signals.objectSelected.dispatch( edge );
    //     scope.signals.rendererChanged.dispatch();
        
    // } );
    
    this.signals.nodePositionChanging.add( function ( node ) {

            
        
        for( var edge of node.graphElement.outgoingEdges ) {
            var endNode = scope.graph.nodes[edge.to];
            scope.changeEdgePosition( edge, node.position, new THREE.Vector3(endNode.coordinate.x, endNode.coordinate.y, 0 ),node.graphElement.orginalCoordinate, endNode.orginalCoordinate );
            // scope.editor.select(edge);
            scope.editor.addOrRemoveEdgeObjectToInvoice(edge);

        }
        for( var edge of node.graphElement.incomingEdges ) {
            var startNode = scope.graph.nodes[edge.from];
            scope.changeEdgePosition( edge, new THREE.Vector3(startNode.coordinate.x, startNode.coordinate.y, 0 ), node.position, startNode.orginalCoordinate, node.graphElement.orginalCoordinate );
            scope.editor.addOrRemoveEdgeObjectToInvoice(edge);
        }

        scope.signals.rendererChanged.dispatch( );
    } );

};

NetworkVisualization.prototype = {


    readGraphFromString: function( dataDict ){
        this.readRoadTypeFromString(dataDict.roadTypes);
        this.readNodesFromString(dataDict.nodes);
        this.readEdgesFromString(dataDict.edges);
        this.readTripsFromString(dataDict.trips);
        this.renderGraph(dataDict.flows);
    },

    readNodes : function( ){
        var scope = this;
        d3.text("dataFile/nodes.csv", function(data) {
            scope.readNodesFromString(data);
            scope.readEdges();
        });
    },
    // read road type, data contains the basic info of a specific road type
    readRoadTypeFromString:function( data ){
      

        var maxCapacity = 0;
        var rows = data.split( '\n' );
        Config.budget = parseFloat(rows[0].trim().split(',')[1]);
        this.signals.budgetChanged.dispatch();
        for ( var i = 2 ; i < rows.length ; i += 1 ) {
            var attribute = rows[i].trim().split( ',' );
            if (attribute.length < 9) continue;
            var capacityPerLane = parseFloat(attribute[2]);
            var maxLanes = parseFloat(attribute[5]);
            var currCapcity = capacityPerLane*maxLanes;
            if(maxCapacity < currCapcity) maxCapacity = currCapcity;
            Config.roadTypes[attribute[0]] = new RoadType(attribute[1],capacityPerLane, parseFloat(attribute[3]), parseFloat(attribute[4]), maxLanes, parseFloat(attribute[6]), parseFloat(attribute[7]), parseFloat(attribute[8]),i);
        }
        Config.maxCapacity = maxCapacity;
    },

    readNodesFromString : function( data ){
    
        // Config.coordinateMean = 0;
        // Config.coordinateRange = 0;
        var scope = this;
        var min = Infinity;
        var max = -Infinity;
        var normalizedData = {};
        var len = 0;
        var rows = data.split( '\n' );
        
        for ( var i = 1 ; i < rows.length ; i += 1 ) {
            
            var row = rows[i].trim().split( ',' );
            if( row.length < 3 ) continue;
            
            var x = parseFloat( row[1] );
            var y = parseFloat( row[2] ); 
            Config.coordinateMean.x += x;
            Config.coordinateMean.y += y;
            len += 1;

            if ( x < y ) {
                if ( min > x ) min = x;
                if ( max < y ) max = y;
            }
            else {
                if ( min > y ) min = y;
                if ( max < x ) max = x;
            }
            // add node and orginal coordinate data to graph structure
            var currNodeUUID = scope.setUUID();
            scope.graph.createAndAddNode( currNodeUUID, row[0] );
            scope.graph.setNodeOrignalCoordinate( currNodeUUID, new THREE.Vector2( x, y ) );
        }
    
        // Config.coordinateMean = Config.coordinateMean / len;

        Config.coordinateMean.x = Config.coordinateMean.x / len;
        Config.coordinateMean.y = Config.coordinateMean.y/ len;
        // min -= Config.coordinateMean;
        // max -= Config.coordinateMean;
        Config.coordinateRange = Math.max(Math.abs(min), Math.abs(max));
        Config.coordinateScalar = Config.coordinateRange/50;
 


        for ( let [key, node] of Object.entries(  scope.graph.nodes ) ) {
            var newRenderCoor = inverseToRenderCoordinate( node.orginalCoordinate.x,node.orginalCoordinate.y);
            scope.graph.setNodeCoordinate(key, new THREE.Vector2( newRenderCoor[0] , newRenderCoor[1]) );
        }

        

        console.log(scope.graph);

    },
    

    readEdges : function ( ) {
        var scope = this;
        d3.text("dataFile/networks.csv", function(data) {
            scope.readEdgesFromString(data);
            scope.readFlows();
        });
    },

    readEdgesFromString : function ( data  ) {
        var scope = this;
        var maxCapacity = -Infinity;
        var lines = data.split( '\n' );
        var startIndex = 1;
        // Config.roadType = {};
        
        // for ( let i = startIndex ; i< lines.length ; i += 1 ) {
        //     var line = lines[i].split(',');
        //     if (line.length < 10 ) continue;
        //     var capacity = parseFloat(line[2]);
        //     if( capacity > Config.maxCapacity ) {
        //         Config.maxCapacity = capacity;
        //     }
        // }

        var typeNum = 0;
        var wset = new Set();
        for ( let i = startIndex ; i< lines.length ; i += 1 ) {
            var line = lines[i].trim().split(',');
            if (line.length < 8 ) continue;
            var numberOfLanes = parseFloat(line[6]);
            var roadType = line[7];
 
            
            var lineWidth = calculateLineWidth(getCapacity(roadType,numberOfLanes));
            wset.add(lineWidth);
            scope.graph.createAndAddEdgeByNodeName( line[0], line[1], lineWidth, line[2], line[3],line[4], line[5], numberOfLanes, roadType);
        }
      
        // Config.roadType = sortRoadType(Config.roadType);
        // for(let key of Object.keys(Config.roadType)) {
        //     Config.minRoadType = key;
        //     break;
        // }

       
    },

    readFlows : function ( ) {
        var scope = this;
        d3.text("dataFile/flows.csv", function(data) {
            scope.readFlowsFromString( data );
            scope.readTrips();
        });
    },

    readFlowsFromCsvString : function ( data ) {

        var scope = this;
        var maxVolume= -Infinity;
        var rows = data.split( '\n' );
        var startIndex = 6  ;
        //find max flow 
        for ( let i = startIndex ; i< rows.length ; i += 1 ) {
            let row = rows[i].split(',');
            if (row.length < 4 ) continue;
            var volume = parseFloat(row[2]);
            if( volume > maxVolume ) {
                maxVolume = volume;
            }
        }
        for ( i = startIndex ; i< rows.length ; i += 1 ) {
            let row = rows[i].split(',');
            if (row.length < 4 ) continue;
            var lineColor = calculateColor(parseFloat(row[2]),maxVolume);
            scope.graph.addFlowByName(row[0], row[1], lineColor, row[2],row[3] );
        }

        function calculateColor( volume, maxVolume ) {
            var r = volume/maxVolume*255;
            var g = 255 - volume/maxVolume*255;
            return rgbToHex(r, g, 0);
        }
    },


    readFlowsFromRawDataString : function ( data ) {

        var scope = this;
        var maxVolume= -Infinity;

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
        var totalTstt = 0;
        //find max flow 
        for ( ; i< lines.length ; i += 1 ) {
            var line = lines[i].split('\t');
            if (line.length < 7 ) continue;
            var volume = round2Dec(line[4].replace(' ',''));
            var cost = round2Dec(line[5].replace(' ',''));
            
            if( volume > maxVolume ) {
                maxVolume = volume;
            }
            totalTstt += volume*cost;
        }

        scope.signals.tsttChanged.dispatch(round2Dec(totalTstt));
    
        for ( i = startIndex ; i< lines.length ; i += 1 ) {
            var line = lines[i].split('\t');
            if (line.length < 7 ) continue;
            var lineColor = calculateColor(parseFloat(line[4].replace(' ','')),maxVolume);
            scope.graph.addFlowByName(line[1].replace(' ',''), line[2].replace(' ',''), lineColor, line[4].replace(' ',''),line[5].replace(' ','') );

        }

        function calculateColor( volume, maxVolume ) {

            var r = volume/maxVolume*255;
            var g = 255 - volume/maxVolume*255;
            return rgbToHex(r, g, 0);       

        }   
    
    },

    readTrips : function ( ) {
        var scope = this;
        // var maxVolume= -Infinity;
        d3.text("dataFile/trips.csv", function(data) {
            scope.readTripsFromString(data);
            scope.renderGraph( );
        });
    },


    readTripsFromString : function ( data ) {
    
        var scope = this;
        // var maxVolume= -Infinity;
        let startIndex = 1;
        let rows = data.split('\n');
         

        let endNodesName = rows[0].trim().split(',');
        let endNodeNum = endNodesName.length-1;
        let maxVolume = -Infinity;
        let minVolume = Infinity;

        for( let i = startIndex ; i < rows.length ; i+= 1 ) {
            if(rows[i].length < 3 )continue;
            let volumes = rows[i].trim().split(',').slice(1).map(Number);
            let rowMaxVolume = Math.max.apply(Math,volumes);
            let rowMinVolume = Math.min.apply(Math,volumes);
            if ( rowMaxVolume > maxVolume ) maxVolume = rowMaxVolume;
            if ( rowMinVolume < minVolume ) minVolume = rowMinVolume;
        }
    

        let range = maxVolume-minVolume;
     

        for( let i = startIndex ; i < rows.length ; i += 1 ) {
            let row = rows[i].trim().split(',');
         
            if(row.length < 3 )continue;
            startNode = row[0];
            for( let j = 1; j < endNodeNum+1 ; j += 1 ) {

                let currVol = parseFloat(row[j]);
            
                let lineWidth = Math.round10(Math.tanh(currVol/(maxVolume)),-2);
                let opacity = (currVol - minVolume)/(range);
                // if(lineWidth > 0.6) console.log(lineWidth);

                let endNode = endNodesName[j];
                scope.graph.addTripByName(startNode,endNode,currVol,lineWidth,opacity);
            } 
        }
    
    },


    renderGraph : function ( flows ) {
     
        var scope = this;
        for ( let [key,node] of Object.entries(this.graph.nodes) ) {
           
            scope.renderNode( node );
            scope.renderEdges( node );
            // this.renderFlows( node );
            // this.renderTrips( node );
            
        }   

        scope.renderTrips( );
        if(flows) this.signals.readFlows.dispatch(flows);
        this.signals.rendererChanged.dispatch();
    },

    renderNode : function ( node ) {

        var geometry = new THREE.PlaneGeometry( 3, 3 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1, map: Config.nodeTexture, alphaTest: 0.2} );
        var nodeObject = new THREE.Mesh( geometry, material );
        nodeObject.position.set(node.coordinate.x,node.coordinate.y, 0 );
        this.nodesContainer.add(nodeObject);
        // this.flowNodeContainer.add(nodeObject.clone());
        // this.tripNodeContainer.add(nodeObject.clone());

        var nodeNameLabel = new THREE.TextSprite({
            textSize: 1.5,
            redrawInterval: 0,
            texture: {
              text: node.name,
              fontFamily: 'Arial',
            },
            material: {
              color: 0xFFFFFF,
              fog: false,
              transparent: true
            },
          });
          nodeNameLabel.position.set(0 , 0 , 0 );
          nodeObject.add(nodeNameLabel);
          nodeObject.name = 'node';
          nodeObject.uuid = node.uuid;
          nodeObject.type = '0';
          nodeObject.graphElement = node;
          this.objects.push(nodeObject);

          

    },
    createLabel:function(name){
        var nodeNameLabel = new THREE.TextSprite({
            textSize: 1.5,
            redrawInterval: 0,
            texture: {
              text: name,
              fontFamily: 'Arial',
            },
            material: {
              color: 0xFFFFFF,
              fog: false,
              transparent: true
            },
        });
        return nodeNameLabel;

    },

    cloneNodes : function( source, dist ){
        
        for(var node of source.children){
            var newNode = node.clone();
        
            newNode.add(this.createLabel(node.graphElement.name));
            dist.add(newNode);
            // break;
        }
    },

    changeEdgePosition : function( edge, startPosition, endPosition, realStartPos, realEndPos ) {
        
        var startPos = startPosition.clone();
     
        var endPos = endPosition.clone();
        edge.graphElement.modifiedLength = calculateRoadLength( realStartPos, realEndPos );
        var arrowDirection = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
        var perpendicularVector = this.getPerpendicularVector(arrowDirection);
 
        endPos.addVectors( endPos, perpendicularVector );
        startPos.addVectors( startPos, perpendicularVector );

        startPos.addVectors(startPos,arrowDirection );
        endPos.subVectors(endPos,arrowDirection );

        var distance = startPos.distanceTo( endPos );
        var middlePoint = new THREE.Vector3().addVectors( endPos, startPos ).multiplyScalar(0.5);

        //move the middle control point along the perpendiculaer vector with dynamic scalar related to the distance  
        middlePoint.addVectors( middlePoint, perpendicularVector.multiplyScalar(Math.log(edge.scalar*distance+1)) );
        var curve = new THREE.QuadraticBezierCurve3(
            startPos,
            middlePoint,
            endPos
        
        );

        var points = curve.getPoints( 50 );
        var arrowPosition = points[parseInt(points.length/2)];
        var geometry = new THREE.Geometry().setFromPoints(points);
        var row = new MeshLine();
        row.setGeometry( geometry );

        var arrow = edge.children[0];
        arrow.setDirection(arrowDirection);
        arrow.position.set(arrowPosition.x, arrowPosition.y,0);
        edge.geometry.dispose();
      
        edge.geometry = row.geometry;
    },

    getPerpendicularVector : function( vector ){

        return vector.clone().applyAxisAngle(this.unitZVector, Math.PI/2).divideScalar(2);
    },

    renderEdges: function ( node ) {
        for( let [endNodeKey,edges] of Object.entries( node.edges )) {
            for ( var i = 0 ; i<edges.length ; i += 1  ) {
                var edgeObject = this.createEdgeObject(node,this.graph.nodes[endNodeKey], edges[i],i, this.getEdgeColor(edges[i].modifiedType), edges[i].lineWidth);
                this.edgesContainer.add(edgeObject);
                this.objects.push(edgeObject);
                node.outgoingEdges.push(edgeObject);
                this.graph.nodes[endNodeKey].incomingEdges.push(edgeObject);
            }

        }

    },
    getEdgeColor: function( type ){
        
        return new THREE.Color(Colors[Config.roadTypes[type].colorIndex]);

    },

    createEdgeObject: function ( startNode ,endNode, edge, scalar,color,lineWidth) {
        var key = endNode.uuid;


        // var lineWidth = edge.lineWidth;

        var capacity = edge.capacity;

        // var color = this.getEdgeColor(edge.modifiedType);
        // init start and end position of edge and create edge
        var startPos = new THREE.Vector3( startNode.coordinate.x, startNode.coordinate.y, 0 );
        var endPos = new THREE.Vector3( endNode.coordinate.x, endNode.coordinate.y, 0 );

        // transfer the row along the perpendicular vector position and arrow direction
        var arrowDirection = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
        var perpendicularVector = this.getPerpendicularVector(arrowDirection);

    
        endPos.addVectors( endPos, perpendicularVector );
        startPos.addVectors( startPos, perpendicularVector);

        startPos.addVectors(startPos,arrowDirection );
        endPos.subVectors(endPos,arrowDirection );

        var distance = startPos.distanceTo( endPos );

        var middlePoint = new THREE.Vector3().addVectors( endPos, startPos ).multiplyScalar(0.5);

        middlePoint.addVectors( middlePoint, perpendicularVector.multiplyScalar(Math.log(scalar*distance+1)) );
        var curve = new THREE.QuadraticBezierCurve3(
            startPos,
            middlePoint,
            endPos
        
        );
        var points = curve.getPoints( 50 );
        var arrowPosition = points[parseInt(points.length/2)];
        var geometry = new THREE.Geometry().setFromPoints(points);
        var row = new MeshLine();
        row.setGeometry( geometry );
        //var lineColor = new THREE.Color(color);
        var material = new MeshLineMaterial({color:color,sizeAttenuation:true,lineWidth:lineWidth, transparent:false, opacity:1});
          
        var edgeObject = new THREE.MeshLine(row.geometry, material);
        edgeObject.color = color;
        edgeObject.name = 'link';
        edgeObject.scalar = scalar;

        // add arrow to indicate the direction
        var arrow = this.renderArrow( arrowDirection, arrowPosition ); 
        edgeObject.center = arrow.position.clone();
        edgeObject.add(arrow);
        edgeObject.type = 0;
        edgeObject.graphElement = edge;

        edgeObject.from = startNode.uuid;
        edgeObject.to = key;
        return edgeObject;

    },
    getMiddlePointPosition:function(){

    },

    renderFlows: function (  ) {

        removeObjects(scope.flowScene);

 
        this.cloneNodes(this.nodesContainer,this.flowScene);
        // editor.flowScene.children[2] = this.nodesContainer.clone();

        for ( let node of Object.values(this.graph.nodes) ) {
            for( let [key,flows] of Object.entries( node.flows )) {
                for( var i = 0; i< flows.length ; i += 1) {
                    var flowObject = this.createEdgeObject(node,this.graph.nodes[key], flows[i],i,new THREE.Color(flows[i].lineColor),0.34);
                    flowObject.name = 'flow';
                
                    this.flowScene.add(flowObject);
                }
            }
        }
    },

    renderTrips: function (  ) {

 
        removeObjects(scope.tripScene);
        this.cloneNodes(this.nodesContainer, this.tripScene);
        for ( let [key,node] of Object.entries(this.graph.nodes) ) {
           
        

            for( let [endNode,trips] of Object.entries( node.trips )) {
    
                // init start and end position of trip
                var startPos = new THREE.Vector3( node.coordinate.x, node.coordinate.y, 0 );
                var endPos = new THREE.Vector3( this.graph.nodes[endNode].coordinate.x, this.graph.nodes[endNode].coordinate.y, 0 );

                // break
                var geometry = new THREE.Geometry();
                geometry.vertices.push( startPos );
                geometry.vertices.push( endPos );
                // create a row object to indicate trip
                var row = new MeshLine();
                row.setGeometry( geometry );

                var material = new MeshLineMaterial({color:new THREE.Color(0xff0000),sizeAttenuation:true,lineWidth: trips.lineWidth, transparent:true, opacity:trips.opacity});
                var tripsObject = new THREE.Mesh( row.geometry, material );

                this.tripScene.add(tripsObject);
            }

        }

    },

    renderArrow: function( arrowDirection, arrowPosition ) {

        // var arrowPosition = new THREE.Vector3().addVectors( startPos, endPos ).divideScalar(2);
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

        for( var child of Object.values( container.children ) ) {
            child.getObjectByName('capcity').visible = bool;
        }

    },

    setPathVisible: function(container, bool){

        container.visible = bool;

    },

    setUUID : function () {

        return THREE.Math.generateUUID();
    },


};

function getMuliMinMaxFromTable(data, targetIndices){

    var values = {};
    function replaceValues(row) {
        for ( let index of Object.keys(values) ) {
            var currVal = data[index];
            if(currVal > values[index].max) values[index].max = currVal;
            if(currVal < values[index].min) values[index].min = currVal;
           
        }
    } 
    
    for( let i of targetIndices ) {
        values[i].max = -Infinity;
        values[i].min = Infinity;
    }

    for ( let row of data ) {
        replaceValues(row);
    }

    return values;



}

function round2Dec(num) {

    return Math.round10(parseFloat(num),-2);
    
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function convertToFileCoordinate( coorX, coorY ) {
    return [(coorX*Config.coordinateScalar+Config.coordinateMean.x),(coorY*Config.coordinateScalar+Config.coordinateMean.y)];

}

function inverseToRenderCoordinate( coorX, coorY ) {

    return [ round2Dec( ( coorX - Config.coordinateMean.x )/Config.coordinateScalar ), round2Dec( ( coorY - Config.coordinateMean.y )/Config.coordinateScalar )];

}



function calculateLineWidth( capacity ) {

    return Math.round10(Math.tanh(capacity/Config.maxCapacity),-2);
}

function calculateRoadLength ( startPos, endPos ) {
    return Math.round10(startPos.distanceTo(endPos),-2);

}

function getCapacity( roadTypeName, numberOfLanes ){
    return Config.roadTypes[roadTypeName].capacity*numberOfLanes;
}

function getFreeFlow(length,speedLimit) {

    return Math.round10(length/speedLimit*60,-2); 
}

function sortRoadType(obj) {
  
    var arr = [];
    var prop;
    var type = 1;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': parseFloat(prop),
            });
        }
    }
    var result = {};
    arr.sort(function(a, b) {
        return a.key - b.key;
    }).map(function(i){result[i.key]= type; type+=1;});

    return result; // returns array
}
