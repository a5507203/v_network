var Viewport = function ( editor ) {

	var signals = editor.signals;
	var animationLoopId;
	var preCamera;
	//var animationCamera = undefined;
 	var container  = this.container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	///container.add( new Viewport.Info( editor ) );

	//

	var nodePairs = [];


	var renderer =  new THREE.WebGLRenderer(  );
	renderer.setClearColor( 0xffffff, 1 );

	renderer.autoClear = false;
	// renderer.autoUpdateScene = false;
	// renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
	container.dom.appendChild( renderer.domElement );

	var camera = editor.camera;
	// scenes
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;
	var flowScene = editor.flowScene;
	var tripScene = editor.tripScene;

	var objects = editor.objects;

	// helpers

	var grid = new THREE.GridHelper( 500, 250, 0x444444, 0x888888 );


	grid.rotateX( Math.PI / 2 );
	grid.visible = false;
	// var grid = new THREE.GridHelper( 30, 30, 0x444444, 0x888888 );
	// sceneHelpers.add( grid );

	var array = grid.geometry.attributes.color.array;

	// for ( var i = 0; i < array.length; i += 60 ) {
	// 	//console.log(array[i])
	// 	for ( var j = 0; j < 12; j ++ ) {
	// 		//console.log(array[ i + j ])
	// 		array[ i + j ] = 0.26;

	// 	}

	// }
	sceneHelpers.add( grid );

	//

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var objectPositionOnDown = null;


	var transformControls = new THREE.TransformControls( camera, container.dom );


	transformControls.addEventListener( 'change', function () {
		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );
			// if ( editor.helpers[ object.id ] !== undefined ) {

			// 	editor.helpers[ object.id ].update();

			// }
			signals.nodePositionChanging.dispatch(object);
			signals.refreshSidebarObjectProperties.dispatch( object );

		}

		//renderAll();

	} );

	transformControls.addEventListener( 'mouseDown', function () {
		
		
		var object = transformControls.object;

		objectPositionOnDown = object.position.clone();

		controls.enabled = false;

	} );

	transformControls.addEventListener( 'mouseUp', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {
	
			if ( ! objectPositionOnDown.equals( object.position ) ) {
			
				editor.execute( new SetPositionCommand( object, object.position,objectPositionOnDown ) );

			}
		}

		controls.enabled = true;

	} );
	sceneHelpers.add( transformControls );

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	

	// events

	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, editor.camera );

		return raycaster.intersectObjects( objects );

	}

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {
		
			var intersects = getIntersects( onUpPosition, objects );
			//var intersects = []

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;
				
				
				if ( object.userData.object !== undefined ) {


					
				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );

			}

			renderAll();

		}

	}

	function onMouseDown( event ) {

		event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );


		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseUp( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	}

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	}

	function onDoubleClick( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.rendererChanged.dispatch(  );

	} );


	// signals

	// signals.editorCleared.add( function () {

	// 	controls.center.set( 0, 0, 0 );
	// 	renderAll();

	// } );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();
		
		if ( object !== null && object !== scene && object !== editor.camera ) {
			
			if( object.name == 'node') {
				box.setFromObject( object );
				if ( box.isEmpty() === false ) {

					selectionBox.setFromObject( object );
					selectionBox.visible = true;
					
				}
			}
			else{

				object.material.uniforms.color.value = new THREE.Color(0x00ffff);
			}

			//TODO if (object.type != 0 && editor.mode != "AnimationMode" )
			if (editor.mode != "AnimationMode" && object.name != 'link' && editor.addNewEdgeMode == 0 && editor.nodeMoveable != 0)
				transformControls.attach( object );
			if ( editor.addNewEdgeMode == 1 ) {
				console.log('node pair length',nodePairs.length);
				if (nodePairs.length < 2 && object.name == 'node' ) {
					nodePairs.push(object);
				
					
			
				}
				if(nodePairs.length == 2){

					signals.addNewEdge.dispatch(nodePairs);
				}
			}

		}

		renderAll();

	} );


	signals.clear.add( function (  ) {

		editor.clear();

	} );

	signals.objectAdded.add( function ( object ) {

		objects.push( object );
		if (object.name == 'node'){
			console.log('push',object);
			console.log(objects.length);

		}

	} );

	signals.addNewEdgeStart.add( function ( object ) {
		editor.deselect();
		editor.addNewEdgeMode = 1;

	} );

	signals.addNewEdgeEnd.add( function ( object ) {
		console.log('cleared node pairs');
		editor.addNewEdgeMode = 0;
		nodePairs = [];

	} );


	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			selectionBox.setFromObject( object );
			transformControls.update();

		}


		// if ( editor.helpers[ object.id ] !== undefined ) {

		// 	editor.helpers[ object.id ].update();

		// }

		renderAll();

	} );
	signals.modeChanged.add( function ( mode ) {
        
        if( mode == 'EditMode') {
    
            signals.showGridChanged.dispatch(true);
    
        
        }
        else {

            signals.showGridChanged.dispatch(false);
        }

        editor.mode = mode;

    } );

	signals.objectRemoved.add( function ( object ) {

		// object.traverse( function ( child ) {

		// 	objects.splice( objects.indexOf( child ), 1 );

		// } );
		var index = objects.indexOf(object);

		if (index != -1) {
			objects.splice(index, 1);
			// console.log('remove ' + object.name + " "+objects.length);
		}
		console.log(object,objects);

	} );





	signals.windowResize.add( function () {

		// TODO: Move this out?

		editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		editor.DEFAULT_CAMERA.updateProjectionMatrix();

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		renderAll();

	} );

	signals.showGridChanged.add( function ( showGrid ) {
		console.log(showGrid);
		grid.visible = showGrid;
		renderAll();

	} );



	signals.rendererChanged.add( function ( ) {

		renderAll();

	} );

	function renderAll() {
		//requestAnimationFrame(animate);
	//	console.log("renders")

		renderer.setClearColor( 0xffffff );
		renderer.setScissorTest( false );
		renderer.clear();
		renderer.setClearColor( 0xe0e0e0 );
		renderer.setScissorTest( true );

		var rect = container.dom.getBoundingClientRect();

		render( rect, scene);
		render( rect, sceneHelpers);

		if(editor.trafficFlow) render( rect, flowScene);

		if(editor.desireLines) render( rect, tripScene);

	}

	function render(rect, scene){

		scene.updateMatrixWorld();

		var userData = scene.userData;
		var camera = userData.camera;

		var left   = Math.floor( rect.width  * userData.left );
		var top    = Math.floor( rect.height  * userData.top );
		var width  = Math.floor( rect.width  * userData.width );
		var height = Math.floor( rect.height * userData.height );

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setViewport( left, top, width, height );
		renderer.setScissor( left, top, width, height );

		renderer.render( scene, camera  );
	}



};
