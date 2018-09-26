var RoadType = function (name,capacity,speed,minLanes,maxLanes,constructionCost,laneAddingCost,upgradeCost,colorIndex){
    
    this.capacity = capacity;
    this.speed = speed;
    this.minLanes = minLanes;
    this.maxLanes = maxLanes;
    this.constructionCost = constructionCost;
    this.laneAddingCost = laneAddingCost;
    this.upgradeCost = upgradeCost;
    this.colorIndex = colorIndex;
    this.name = name;

};

RoadType.prototype = {
    toCsv: function ( index ) {
        return index+','+this.name + ',' + this.capacity + ',' + 
        this.speed + ',' + this.minLanes +',' + this.maxLanes + ',' + this.constructionCost + ',' +
        this.laneAddingCost +  ',' + this.upgradeCost + '\n';
    }
};

var Node = function (uuid, name) {
    this.uuid = uuid;
    this.name = name;
    this.coordinate = { };
    this.orginalCoordinate = { };
    this.edges = { };
    this.flows = { }; 
    this.trips = { };
    this.outgoingEdges = [];
    this.incomingEdges = [];


};

Node.prototype = {


    getFlowCsv: function( nodes,nodesIdList ){

        // GET FLOW FROM DATA STRUCTURE 
        var flowsRows = '';
        for( let endNodeId of nodesIdList){
            if (this.flows.hasOwnProperty(endNodeId)) {
                for (var flow of this.flows[endNodeId]){
                    flowsRows += flow.toCsv(this.name, nodes[endNodeId].name);
                }
            }
        }

        return flowsRows;
    },

    toCsv: function( nodes,nodesIdList ){
        var nodeRow = this.name +','+this.orginalCoordinate.x+','+this.orginalCoordinate.y+'\n';

        var edgesRows = '';
        for( let endNodeId of nodesIdList ){
            if (this.edges.hasOwnProperty(endNodeId)) {
                for( let edge of this.edges[endNodeId]) {
                    edgesRows += edge.toCsv(this.name, nodes[endNodeId].name);
                }
            }
            
        }


        var tripsRow = this.name;
        for( let endNodeId of nodesIdList ){
            if (this.trips.hasOwnProperty(endNodeId)) {
                tripsRow += this.trips[endNodeId].toCsv();

            }
            // else console.log(endNodeId)
        }
        tripsRow = tripsRow+ "\n";

        return  {
            nodeRow: nodeRow,
            edgesRows: edgesRows,
            // flowsRows: flowsRows,
            tripsRow: tripsRow
        };
    }


};

var Edge = function( lineWidth, length, b, power, toll, numberOfLanes, type, modifiedType, modifiedNumberOfLanes, modifiedLength ) {
    this.lineWidth = lineWidth;
    this.length = length; 
    this.numberOfLanes = numberOfLanes;
    this.b = b; 
    this.power = power; 
    this.toll = toll; 
    this.type = type;

    if( modifiedLength )
        this.modifiedLength = modifiedLength;
    else
        this.modifiedLength = length;

    if( modifiedType )
        this.modifiedType = modifiedType;
    else
        this.modifiedType = type;

    if( modifiedNumberOfLanes )
        this.modifiedNumberOfLanes = modifiedNumberOfLanes;
    else
        this.modifiedNumberOfLanes = numberOfLanes;
};

Edge.prototype = {
    //Init node,Term node,Length (km),B,Power,Toll,Number of lanes,Road type,Speed limit,Capacity,Free flow time
    toCsv: function(startNode, endNode){

        var speedLimit = Config.roadTypes[this.modifiedType].speed;
        return startNode + ',' + endNode+ ',' + 
        this.modifiedLength + ',' + this.b + ',' + this.power + ',' + this.toll + ',' + this.modifiedNumberOfLanes + ',' +
        this.modifiedType + ',' + speedLimit + ',' + getCapacity(this.modifiedType, this.modifiedNumberOfLanes) +  ',' + this.modifiedLength/speedLimit +'\n';
    }
    
};

var Flow = function( lineColor, volume, cost ) {
    this.lineColor = lineColor;
    this.volume = volume;
    this.cost = cost;
};

Flow.prototype = {
    //Tail,Head,Volume,Cost
    toCsv: function(startNode, endNode){
        return startNode + ',' + endNode+',' + this.volume + ',' + this.cost + '\n';
    }
    
};


var Trip = function( volume, lineWidth, opacity ) {
    this.volume = volume;
    this.lineWidth = lineWidth;
    this.opacity = opacity;

};

Trip.prototype = {

    toCsv: function(){
        return  ',' + this.volume;
    }
    
};

var Graph = function Graph() {
    this.nodes = {};

};
  
 
Graph.prototype = {
      
    
    createAndAddNode : function ( uuid, name ) {

        if ( this.nodes[uuid] ) return;
        this.nodes[uuid] = new Node( uuid, name );
        return this.nodes[uuid];
        
    },

    createNode: function( uuid, name, coordinate, orginalCoordinate ){
        if ( this.nodes[uuid] ) return;
        var newNode = new Node( uuid, name );
        newNode.coordinate = coordinate;
        newNode.orginalCoordinate = orginalCoordinate;
        return newNode;

    },

    addNode: function( node ){
        this.nodes[node.uuid] = node; 
         

    },

    setNodeCoordinate : function ( uuid, coordinate ) {

        if ( !this.nodes[uuid] ) return;
        this.nodes[uuid].coordinate = coordinate;
        
    },

    setNodeOrignalCoordinate : function ( uuid, orginalCoordinate ) {

        if ( !this.nodes[uuid] ) return;
      
        this.nodes[uuid].orginalCoordinate = orginalCoordinate;
        
    },

    getNode : function ( uuid ) {

        return this.nodes[uuid];

    },

    removeNode : function ( uuid ) {

        if ( !this.nodes[uuid] ) return;
        delete this.nodes[uuid];

        for ( const node of Object.values( this.nodes ) ) {
            if ( !node.edges[uuid] ) return;
            delete node.edges[uuid];
        }


    },
   // "Init node ", "Term node ", "Capacity ", "Length ", "Free Flow Time ", "B", "Power", "Speed limit ", "Toll ", "Type"
    createAndAddEdgeByNodeName : function ( startNodeName, endNodeName, lineWidth, length, b, power, toll, numberOfLanes, type ) {
        var start = this.findUUIDbyNodeName ( startNodeName );
        var end = this.findUUIDbyNodeName ( endNodeName );
        // var length = calculateRoadLength(startNode.orginalCoordinate, endNode.orginalCoordinate)
        this.addEdge(start,end,new Edge( lineWidth, calculateRoadLength(this.nodes[start].orginalCoordinate, this.nodes[end].orginalCoordinate), b, power, toll, numberOfLanes, type ));
        //this.addEdge(start,end,new Edge( lineWidth, length, b, power, toll, numberOfLanes, type ));

    },

    findUUIDbyNodeName : function( name ) {
        
        for( let [key, node] of Object.entries(  this.nodes ) ){
           
            // console.log('nameComb',JSON.stringify(node.name),JSON.stringify(name));
            if ( node.name == name ) { 
                //console.log('key',key);
                return key;
            }
        }

        return null;
    },


    createEdge : function ( start, end, lineWidth, length, b, power, toll, numberOfLanes, type, modifiedType, modifiedNumberOfLanes, modifiedLength ) {
        console.log(start,end);
        if ( !this.nodes[start] || !this.nodes[end] ) return;
        if (this.nodes[start].edges[end] == undefined) scalar = 0;
        else scalar = this.nodes[start].edges[end].length;
       
        return {edge:new Edge( lineWidth, length, b, power, toll, numberOfLanes, type, modifiedType, modifiedNumberOfLanes, modifiedLength ),scalar:scalar};

    },


    addEdge : function ( start, end, edge ) {
        if ( !this.nodes[start] || !this.nodes[end]  ) return;
        if (this.nodes[start].edges[end] == undefined) this.nodes[start].edges[end] = [];
        this.nodes[start].edges[end].push(edge);
    },

    getEdge : function ( start, end  ) {

        return this.nodes[start].edges[end];

    },

    removeEdge : function ( edge ) {

        var start = edge.from;
        var end = edge.to;
        if ( !this.nodes[start] || !this.nodes[end] || !this.nodes[start].edges[end] ) return;

        this.remove(this.nodes[start].edges[end], edge.graphElement);
    },
    

    getNeighbors : function ( uuid ) {

        if ( !this.nodes[uuid] ) return;

        return this.nodes[uuid].edges;
    },


       // "Init node ", "Term node ", "Capacity ", "Length ", "Free Flow Time ", "B", "Power", "Speed limit ", "Toll ", "Type"
    addFlowByName : function ( startNodeName, endNodeName, lineColor, volume, cost ) {
        
        var start = this.findUUIDbyNodeName( startNodeName );
        var end = this.findUUIDbyNodeName( endNodeName );
        if ( !this.nodes[start] || !this.nodes[end]  ) return;
        if (this.nodes[start].flows[end] == undefined) this.nodes[start].flows[end] = [];
        this.nodes[start].flows[end].push(new Flow( lineColor, volume, cost ));

    },


    cleanFlows : function ( ) {
        for( let node of Object.values(this.nodes)) {
            node.flows = {};
        }

    },

    addTripByName : function ( startNodeName, endNodeName, volume, lineWidth, opacity ) {

        var start = this.findUUIDbyNodeName( startNodeName );
        var end = this.findUUIDbyNodeName( endNodeName );
    
        console.log('uuid');
        if ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].trips[end] ) return;
        this.nodes[start].trips[end] = new Trip( volume, lineWidth, opacity );

    },

    getTrip : function ( start, end  ) {

        return this.nodes[start].trips[end];

    },

    removeTrip : function ( start, end  ) {

        if ( !this.nodes[start] || !this.nodes[end] || !this.nodes[start].trips[end] ) return;
        delete this.nodes[start].trips[end];

    },

    getFlowCsv: function(){

        var flowsString = 'Tail,Head,Volume,Cost\n';
        //var flowsString = '\n\n\n\n\nTail,Head,Volume,Cost\n';

        var sortedNodeIdNamePairs = sortObject(this.nodes, 'name', true);
    
        var nodesIdList = sortedNodeIdNamePairs.map(([uuid,name])=>  uuid);

        for(let startNode of nodesIdList ) {
            
            flowsString += this.nodes[startNode].getFlowCsv(this.nodes,nodesIdList);
 


        }
        return flowsString;

    },
    toCsv : function( ) {
    
        var nodesString = 'Node,X,Y\n';
        var edgesString = 'Init node,Term node,Length (km),B,Power,Toll,Number of lanes,Road type,Speed limit,Capacity,Free flow time\n';
        // var flowsString = '\n\n\n\n\nTail,Head,Volume,Cost\n';
        var roadTypesString = 'Road ID,Road type,Capacity,Speed,Min number of lanes,Max number of lanes,Construction cost ($/km),Lane adding cost ($/km),Upgrade cost($/km/ln)\n';


        var sortedNodeIdNamePairs = sortObject(this.nodes, 'name', true);
    
        var nodesIdList = sortedNodeIdNamePairs.map(([uuid,name])=>  uuid);
        // console.log(nodesIdList)
        var tripsString = 'node,'+sortedNodeIdNamePairs.map(([uuid,name])=> name).join() + '\n';
        // console.log(tripsString)

        for(let startNode of nodesIdList ) {
            
            contents = this.nodes[startNode].toCsv(this.nodes,nodesIdList);

            nodesString += contents.nodeRow;
            edgesString += contents.edgesRows;
            // flowsString += contents.flowsRows;
            tripsString += contents.tripsRow;


        }
        // //
        // console.log(Config.roadTypes)
        for ( let [index,roadType] of Object.entries(Config.roadTypes)) {
            roadTypesString += roadType.toCsv(index);

          
        }
        roadTypesString = 'Budget,'+Config.budget+'\n'+roadTypesString;
        return {
            nodes:nodesString,
            edges:edgesString,
            roadTypes: roadTypesString,
            // flows:flowsString,
            trips:tripsString
        };
    },
    
    remove: function(array, element) {
        // console.log(366,array,element);
   		var index = array.indexOf(element);
    
		if (index !== -1) {
			array.splice(index, 1);
		}
	},
    clear: function(){
        clearJSObject(this.nodes);

    }

  
};
  
  
function clearJSObject(obj){
        
    Object.keys(obj).forEach(function (prop) {
        delete obj[prop];
    });
}

function sortObject(object, property, remainProperty){
    var sortedArray = [];

    for (let [key, value] of Object.entries(object)) {
        sortedArray.push([key, value[property]]);
    }
    sortedArray.sort(function(a, b) {
        return a[1] - b[1];
    });
    
    if (!remainProperty){
        sortedArray.map(([a,b])=>a);

    }

    return sortedArray;
}