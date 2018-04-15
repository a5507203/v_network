var Editor = function ( ) {

	this.DEFAULT_CAMERA = new THREE.PerspectiveCamera( 50, 1, 0.1, 10000 );
	this.DEFAULT_CAMERA.name = 'Camera';
	this.DEFAULT_CAMERA.position.set( 0, 0, 60);
	this.DEFAULT_CAMERA.lookAt( new THREE.Vector3() );
	this.mode = 'AnimationMode';

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

		geometryChanged: new Signal(),
		animationChanged: new Signal(),
		objectSelected: new Signal(),

		objectAdded: new Signal(),
		objectRemoved: new Signal(),
		objectChanged: new Signal(),
		modeChanged: new Signal(),
		refreshSidebarObjectProperties: new Signal()

	

	};



	this.camera = this.DEFAULT_CAMERA.clone();
	
	this.scene = new THREE.Scene();
	this.scene.name = 'Scene';
	this.scene.background = new THREE.Color( 0xAAAAAA );

	this.sceneHelpers = new THREE.Scene();
	this.history = new History( this );
	this.object = {};
	this.helpers = {};
	this.selected = null;

};

Editor.prototype = {


	
	addObject: function ( object ) {

		var scope = this;
		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

		

		} );

		this.scene.add( object );
		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},







	moveObject: function ( object, parent, before ) {

		if ( parent === undefined ) {

			parent = this.scene;

		}

		parent.add( object );

		// sort children array

		if ( before !== undefined ) {

			var index = parent.children.indexOf( before );
			parent.children.splice( index, 0, object );
			parent.children.pop();

		}

		this.signals.sceneGraphChanged.dispatch();

	},


	removeObject: function ( object ) {

		if ( object.parent === null ) return; // avoid deleting the camera or scene

		var scope = this;

		object.traverse( function ( child ) {

			scope.removeHelper( child );

		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch( );

	},





	//

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
		this.selected.material.uniforms.color.value = new THREE.Color(0x0000ff);
		// var uuid = null;

		// if ( object !== null ) {

		// 	uuid = object.uuid;

		// }

		this.selected = object;

		//this.config.setKey( 'selected', uuid );
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

	}

};


// function getDataURL( image ) {

// 	var canvas;

// 	if ( image instanceof HTMLCanvasElement ) {

// 		canvas = image;

// 	} else {

// 		canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
// 		canvas.width = image.width;
// 		canvas.height = image.height;

// 		var context = canvas.getContext( '2d' );

// 		if ( image instanceof ImageData ) {

// 			context.putImageData( image, 0, 0 );

// 		} else {

// 			context.drawImage( image, 0, 0, image.width, image.height );

// 		}

// 	}

// 	if ( canvas.width > 2048 || canvas.height > 2048 ) {

// 		return canvas.toDataURL( 'image/jpeg', 0.6 );

// 	} else {

// 		return canvas.toDataURL( 'image/png' );

// 	}

// }