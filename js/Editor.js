var Editor = function (  ) {

	this.DEFAULT_CAMERA = new THREE.PerspectiveCamera( 50, 1, 0.1, 10000 );
	this.DEFAULT_CAMERA.name = 'Camera';
	this.DEFAULT_CAMERA.position.set( 0, 0, 60);
	this.DEFAULT_CAMERA.lookAt( new THREE.Vector3() );
	this.mode = 'AnimationMode';
	this.addNewEdgeMode = 0;

	var Signal = signals.Signal;

	this.signals = {


		editorCleared: new Signal(),

		savingStarted: new Signal(),
		savingFinished: new Signal(),

		rendererChanged: new Signal(),

		windowResize: new Signal(),
		showGridChanged: new Signal(),
		showEdgesChanged: new Signal(),
		showFlowsChanged: new Signal(),
		showLabelsChanged: new Signal(),
		networkElementDisplayChanged: new Signal(),
		cameraChanged: new Signal(),
		animationChanged: new Signal(),
		objectSelected: new Signal(),
		objectAdded: new Signal(),
		objectChanged: new Signal(),
		addNewNode: new Signal(),
		addNewEdge: new Signal(),
		addNewEdgeStart: new Signal(),
		addNewEdgeEnd: new Signal(),
		objectRemoved: new Signal(),
		modeChanged: new Signal(),
		updateEdgesPosition: new Signal(),
		nodePositionChanging: new Signal(),
		historyChanged: new Signal(),
		refreshSidebarObjectProperties: new Signal(),
		lineWidthChanged: new Signal()
		
	

	};

	this.camera = this.DEFAULT_CAMERA.clone();
	
	this.scene = new THREE.Scene();
	this.scene.name = 'Scene';
	this.scene.background = new THREE.Color( 0xAAAAAA );
	this.sceneHelpers = new THREE.Scene();
	this.fileLoader = new FileLoader( this );
	this.history = new History( this );
	
	this.object = {};
	this.helpers = {};
	this.selected = null;
	this.graph = new Graph();
	this.nodesContainer = new THREE.Group();
    this.nodesContainer.position.set( 0, 0, 0.04 );
    this.scene.add( this.nodesContainer );
	this.newEdgesDict = {};
	this.objects = [];
    this.edgesContainer = new THREE.Group();
    this.edgesContainer.position.set( 0, 0, 0.01 );
    this.scene.add( this.edgesContainer );
	
    this.flowsContainer = new THREE.Group();
    this.flowsContainer.position.set( 0, 0, 0.02 );
    this.scene.add( this.flowsContainer );

    this.tripsContainer = new THREE.Group();
    this.tripsContainer.position.set( 0, 0, 0.02 );
    this.scene.add( this.tripsContainer );
	this.networkVisualization = new NetworkVisualization( this );

};

Editor.prototype = {


	setNodeName: function ( node, name ) {
		node.graphElement.name = name;
		console.log(node.graphElement);
		node.children[0].material.map.text = name;
		this.signals.rendererChanged.dispatch();
	},

	setNodePosition: function( object, newPosition , newNetworkPosition){

		object.position.copy( newPosition );
		object.graphElement.orginalCoordinate.copy(newNetworkPosition);
    	object.graphElement.coordinate.set(newPosition.x,newPosition.y);
		object.updateMatrixWorld( true );
		this.signals.nodePositionChanging.dispatch( object );
		this.signals.objectChanged.dispatch( object );
		this.select( object );
	
	},

	addNode: function ( node ) {

		this.nodesContainer.add( node );
		this.graph.addNode( node.graphElement );
		for( var edge of node.graphElement.outgoingEdges ){ 
			this.edgesContainer.add( edge );
			this.graph.nodes[edge.to].incomingEdges.push(edge);
			this.signals.objectAdded.dispatch( edge );
		}
        for( var edge of node.graphElement.incomingEdges ){ 
			this.edgesContainer.add( edge );
			this.graph.nodes[edge.from].outgoingEdges.push(edge);
			this.signals.objectAdded.dispatch( edge );
		}
		Config.newNodeCount += 1;
		this.signals.objectAdded.dispatch( node );
		this.signals.rendererChanged.dispatch();

	},

	removeNode: function ( node ) {

	
		node.parent.remove( node );

	    for( var edge of node.graphElement.outgoingEdges ){ 
			this.edgesContainer.remove( edge );
			this.signals.objectRemoved.dispatch( edge );
			this.remove( this.graph.nodes[edge.to].incomingEdges, edge );
			delete this.newEdgesDict[edge.uuid];
			//this.graph.nodes[edge.to].incomingEdges.remove(edge);
		}
        for( var edge of node.graphElement.incomingEdges ){ 
			this.edgesContainer.remove( edge );
			this.signals.objectRemoved.dispatch( edge );
			//this.graph.nodes[edge.from].outgoingEdges.remove(edge);
			this.remove( this.graph.nodes[edge.from].outgoingEdges, edge );
			delete this.newEdgesDict[edge.uuid];
			//console.log(edge);
		}
		// node.graphElement.outgoingEdges = [];
		// node.graphElement.incomingEdges = [];
		this.deselect();
		this.graph.removeNode( node.graphElement.uuid );
		this.signals.objectRemoved.dispatch( node );
		this.signals.rendererChanged.dispatch( );

	},

	addEdge: function ( edge ) {
		//console.log(edge);
		this.edgesContainer.add(edge);
		this.newEdgesDict[edge.uuid] = edge;
		this.graph.nodes[edge.from].outgoingEdges.push(edge);
		this.graph.nodes[edge.to].incomingEdges.push(edge);
	//	this.signals.nodePositionChanging.dispatch(this.graph.nodes[edge.from]);
		this.signals.updateEdgesPosition.dispatch(edge);
		//updateEdgesPosition
		this.graph.addEdge(edge.from, edge.to, edge.graphElement);
		this.signals.objectAdded.dispatch( edge );
		this.signals.rendererChanged.dispatch( );

	},

	removeEdge: function ( edge ) {

		this.edgesContainer.remove(edge);
		this.graph.removeEdge(edge.from, edge.to);
		delete this.newEdgesDict[edge.uuid];
		this.remove( this.graph.nodes[edge.from].outgoingEdges, edge );
		this.remove( this.graph.nodes[edge.to].incomingEdges, edge );
		this.signals.objectRemoved.dispatch( edge );
		this.signals.rendererChanged.dispatch( );

	},

	setEdgeType: function ( edge, capacity ){
	
		edge.graphElement.type = Config.roadType[capacity];
		edge.graphElement.modifiedCapacity = capacity;

		if( edge.graphElement.capacity != edge.graphElement.modifiedCapacity && !this.newEdgesDict.hasOwnProperty(edge.uuid) ) {
			this.newEdgesDict[edge.uuid] = edge;
		}
		else if(this.newEdgesDict.hasOwnProperty(edge.uuid) && edge.graphElement.capacity == edge.graphElement.modifiedCapacity  ){
			delete this.newEdgesDict[edge.uuid];

		}
		edge.graphElement.lineWidth = calculateLineWidth(capacity);
		//this.signals.refreshSidebarObjectProperties.dispatch( edge );
		this.signals.lineWidthChanged.dispatch( edge );
	},

	selectById: function ( id ) {

		if ( id === this.camera.id ) {
			this.select( this.camera );
			return;

		}
		this.select( this.scene.getObjectById( id, true ) );

	},

	selectByUuid: function ( uuid ) {

		var scope = this;

		this.scene.traverse( function ( child ) {
			//console.log(uuid);
			if ( child.uuid === uuid ) {

				scope.select( child );

			}

		} );

	},
	getObjectByUuid: function ( uuid ) {

		var scope = this;
		var curr = null;
		this.scene.traverse( function ( child ) {
			//console.log(uuid);
			if ( child.uuid === uuid ) {

				curr =  child;

			}

		} );
		return curr;

	},
	deselect: function () {

		this.select( null );

	},

	select: function ( object ) {

		if ( this.selected === object ) return;
		
		if(this.selected && this.selected.name == 'edge')
		//change the edge color back to normal on deselect
		this.selected.material.uniforms.color.value = this.selected.color;
		this.selected = object;
		// if(object && object.name == 'node')
		// 	this.signals.updateEdges.dispatch( object );
		console.log('object');
		this.signals.objectSelected.dispatch( object );

	},


	objectByUuid: function ( uuid ) {

		return this.scene.getObjectByProperty( 'uuid', uuid, true );

	},

	execute: function ( cmd, optionalName ) {

		this.history.execute( cmd, optionalName );

	},

	undo: function () {

		this.history.undo();

	},

	redo: function () {

		this.history.redo();

	},
	remove: function(array, element) {
    var index = array.indexOf(element);
    
    if (index !== -1) {
        array.splice(index, 1);
    }
}

};

