var Viewport = function ( editor ) {

	var signals = editor.signals;
	var animationLoopId;
	var preCamera;

	var canvas = document.createElement('canvas');
	canvas.setAttribute('id', 'c');
	document.body.appendChild(canvas);

	var nodePairs = [];


	var renderer =  new THREE.WebGLRenderer( { canvas: canvas, antialias: false } );
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.autoClear = false;

	// scenes
	var editScene = editor.editScene;
	var camera = editScene.userData.camera;
	var container  = editScene.userData.element;
	var sceneHelpers = editor.sceneHelpers;
	var flowScene = editor.flowScene;
	addOrbitControls(flowScene);

	var fs = new FlowScene(flowScene, editor, renderAll);

	var tripScene = editor.tripScene;
	addOrbitControls(tripScene);
	var objects = editor.objects;

	// helpers

	var grid = new THREE.GridHelper( 500, 250, 0x444444, 0x888888 );
	grid.rotateX( Math.PI / 2 );
	grid.visible = true;
	var array = grid.geometry.attributes.color.array;
	sceneHelpers.add( grid );

	//

	var box = new THREE.Box3();
	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var objectPositionOnDown = null;


	function addOrbitControls(scene){

		var orbitControls = new THREE.OrbitControls( scene.userData.camera, scene.userData.element);
		orbitControls.minDistance = 0.1;
		orbitControls.maxDistance = 700;
		orbitControls.enablePan = true;
		orbitControls.enableRotate = false;
		orbitControls.autoRotate = false;
		orbitControls.addEventListener('change', function(){

			scope.signals.rendererChanged.dispatch();
		});

	}

	var transformControls = new THREE.TransformControls( camera, container );

	transformControls.addEventListener( 'change', function () {
		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );
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

		raycaster.setFromCamera( mouse, camera );

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
	

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;
				

				editor.select( object );

				

			} else {

				editor.select( null );

			}

			renderAll();

		}

	}

	function onMouseDown( event ) {

		event.preventDefault();
		console.log('mouse down')

		var array = getMousePosition( container, event.clientX, event.clientY );
		onDownPosition.fromArray( array );


		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseUp( event ) {

		var array = getMousePosition( container, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	}

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	}

	function onDoubleClick( event ) {

		var array = getMousePosition( container, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

		}

	}

	container.addEventListener( 'mousedown', onMouseDown, false );
	container.addEventListener( 'touchstart', onTouchStart, false );
	container.addEventListener( 'dblclick', onDoubleClick, false );



	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container );
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
		
		if ( object !== null && object !== editScene && object !== camera ) {
			
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
	

	} );





	signals.windowResize.add( function () {

		var width = canvas.clientWidth;
		var height = canvas.clientHeight;
		if ( canvas.width !== width || canvas.height !== height ) {
			renderer.setSize( width, height, false );
		}

		sceneResize(editScene);
		sceneResize(sceneHelpers);
		sceneResize(flowScene);
		sceneResize(tripScene);

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

		render(editScene);
		render(sceneHelpers);
		render(flowScene);
		render( tripScene);

	}



	function render(scene){

		scene.updateMatrixWorld();
		var element = scene.userData.element;
		if(element.style.display == 'none') return;
		// get its position relative to the page's viewport
		var rect = element.getBoundingClientRect();
	
		// check if it's offscreen. If so skip it
		if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight ||
		rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {
			return;  // it's off screen
		}
		// set the viewport
		var width  = rect.right - rect.left;
		var height = rect.bottom - rect.top;
		var left   = rect.left;
		var top    = rect.top;

		renderer.setViewport( left, top, width, height );
		renderer.setScissor( left, top, width, height );
		// var camera = scene.userData.camera;
		// /camera.aspect = width / height; // not changing in this example
		//camera.updateProjectionMatrix();
		// scene.userData.orbitControls.update();
		renderer.render( scene, scene.userData.camera );

	}

	function sceneResize(scene) {

		var camera = scene.userData.camera;
		var dom = scene.userData.element;
		camera.aspect = dom.offsetWidth / dom.offsetHeight;
		// console.log(dom.offsetWidth / dom.offsetHeight);
		camera.updateProjectionMatrix();

	}



};
