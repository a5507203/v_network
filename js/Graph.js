var Node = function (id ) {
    this.id = id;
    this.coordinate = { }
    this.orginalCoordinate = { }
    this.edges = { };
    this.flows = { }; 
    this.trips = { };
}

var Edge = function( lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type ) {
    this.lineWidth = lineWidth
    this.capacity = capacity;
    this.length = length; 
    this.freeFlowTime = freeFlowTime; 
    this.b = b; 
    this.power = power; 
    this.speedLimit = speedLimit; 
    this.toll = toll; 
    this.type = type;

}

var Flow = function( lineColor, volume, cost ) {
    this.lineColor = lineColor
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
      
    
    addNode : function ( id ) {

        if ( this.nodes[id] ) return;
        this.nodes[id] = new Node(id);
        
    },


    setNodeCoordinate : function ( id, coordinate ) {

        if ( !this.nodes[id] ) return;
        this.nodes[id].coordinate = coordinate;
        
    },

    setNodeOrignalCoordinate : function ( id, orginalCoordinate ) {

        if ( !this.nodes[id] ) return;
        this.nodes[id].orginalCoordinate = orginalCoordinate;
        
    },

    getNode : function ( id ) {

        return this.nodes[id];

    },

    removeNode : function ( id ) {

        if ( !this.nodes[id] ) return;
        delete this.nodes[id];

        for ( const node of Object.values( this.nodes ) ) {
            if ( !node.edges[id] ) return;
            delete node.edges[id];
        }


    },
   // "Init node ", "Term node ", "Capacity ", "Length ", "Free Flow Time ", "B", "Power", "Speed limit ", "Toll ", "Type"
    addEdge : function ( start, end, lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type ) {

        if ( !this.nodes[start] || !this.nodes[end] || this.nodes[start].edges[end] ) return;
        this.nodes[start].edges[end] = new Edge( lineWidth, capacity, length, freeFlowTime, b, power, speedLimit, toll, type );

    },

    getEdge : function ( start, end  ) {

        return this.nodes[start].edges[end];

    },

    removeEdge : function ( start, end  ) {

        if ( !this.nodes[start] || !this.nodes[end] || !this.nodes[start].edges[end] ) return;
        delete this.nodes[start].edges[end];
    },

    getNeighbors : function ( id ) {

        if ( !this.nodes[id] ) return;

        return this.nodes[id].edges;
    },


       // "Init node ", "Term node ", "Capacity ", "Length ", "Free Flow Time ", "B", "Power", "Speed limit ", "Toll ", "Type"
    addFlow : function ( start, end, lineColor, volume, cost ) {

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

    addTrip : function ( start, end, volume, lineWidth, opacity ) {

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
  
  


