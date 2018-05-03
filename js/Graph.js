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
}

var Edge = function( lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type, modifiedCapacity ) {
    this.lineWidth = lineWidth;
    this.capacity = capacity;
    this.length = length; 
    this.freeFlowTime = freeFlowTime; 
    this.b = b; 
    this.power = power; 
    this.speedLimit = speedLimit; 
    this.toll = toll; 
    this.type = type;
    if( modifiedCapacity )
        this.modifiedCapacity = modifiedCapacity;
    else
        this.modifiedCapacity = capacity;
}

var Flow = function( lineColor, volume, cost ) {
    this.lineColor = lineColor;
    this.volume = volume;
    this.cost = cost;
} 

var Trip = function( volume, lineWidth, opacity ) {
    this.volume = volume;
    this.lineWidth = lineWidth;
    this.opacity = opacity;

}

var Graph = function Graph() {
    this.nodes = {};
  }
  
 
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
    createAndAddEdgeByNodeName : function ( startNodeName, endNodeName, lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type ) {
        var start = this.findUUIDbyNodeName ( startNodeName );
        var end = this.findUUIDbyNodeName ( endNodeName );
        if ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].edges[end] ) return;
        this.nodes[start].edges[end] = new Edge( lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type );

    },

    findUUIDbyNodeName : function( name ) {
        
        for( let [key, node] of Object.entries(  this.nodes ) )
            if ( node.name == name ) return key;
        

        return null;
    },

    createEdge : function ( start, end, lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type, modifiedCapacity ) {

        if ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].edges[end] ) return;
        return new Edge( lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type, modifiedCapacity );

    },
    hasEdge : function (start, end) {
        return ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].edges[end] );
    },
    addEdge : function ( start, end, edge ) {
        if ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].edges[end] ) return;
        this.nodes[start].edges[end] = edge;
    },

    getEdge : function ( start, end  ) {

        return this.nodes[start].edges[end];

    },

    removeEdge : function ( start, end  ) {

        if ( !this.nodes[start] || !this.nodes[end] || !this.nodes[start].edges[end] ) return;
        delete this.nodes[start].edges[end];
    },

    getNeighbors : function ( uuid ) {

        if ( !this.nodes[uuid] ) return;

        return this.nodes[uuid].edges;
    },


       // "Init node ", "Term node ", "Capacity ", "Length ", "Free Flow Time ", "B", "Power", "Speed limit ", "Toll ", "Type"
    addFlowByName : function ( startNodeName, endNodeName, lineColor, volume, cost ) {
        
        var start = this.findUUIDbyNodeName( startNodeName );
        var end = this.findUUIDbyNodeName( endNodeName );
        if ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].flows[end] ) return;
        this.nodes[start].flows[end] = new Flow( lineColor, volume, cost );

    },

    getFlow : function ( start, end  ) {

        return this.nodes[start].flows[end];

    },

    removeFlow : function ( start, end  ) {

        if ( !this.nodes[start] || !this.nodes[end] || !this.nodes[start].flows[end] ) return;
        delete this.nodes[start].flows[end];

    },

    addTripByName : function ( startNodeName, endNodeName, volume, lineWidth, opacity ) {

        var start = this.findUUIDbyNodeName( startNodeName );
        var end = this.findUUIDbyNodeName( endNodeName );
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

  
}
  
  


