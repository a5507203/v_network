var Viewport = function ( editor ) {

	var signals = editor.signals;
	var animationLoopId;
	var preCamera;
	var animationCamera = undefined;
 	var container  = this.container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	///container.add( new Viewport.Info( editor ) );

	//

	var renderer = new THREE.WebGLRenderer();
	renderer.autoClear = false;
	renderer.autoUpdateScene = false;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
	container.dom.appendChild( renderer.domElement );

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var objects = this.objects = [];

	// helpers

	var grid = new THREE.GridHelper( 100, 50, 0x444444, 0x888888 );


	grid.rotateX( Math.PI / 2 );
	grid.visible = false;
	// var grid = new THREE.GridHelper( 30, 30, 0x444444, 0x888888 );
	// sceneHelpers.add( grid );

	var array = grid.geometry.attributes.color.array;

	// for ( var i = 0; i < array.length; i += 60 ) {
	// 	//console.log(array[i])
	// 	for ( var j = 0; j < 12; j ++ ) {
	// 		console.log(array[ i + j ])
	// 		//array[ i + j ] = 0.26;

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
		//console.log('changed');
		var object = transformControls.object;

		if ( object !== undefined ) {

			 selectionBox.setFromObject( object );

			// if ( editor.helpers[ object.id ] !== undefined ) {

			// 	editor.helpers[ object.id ].update();

			// }

			signals.refreshSidebarObjectProperties.dispatch( object );

		}

		render();

	} );

	transformControls.addEventListener( 'mouseDown', function () {
		
		var object = transformControls.object;

		objectPositionOnDown = object.position.clone();

		//controls.enabled = false;

	} );

	transformControls.addEventListener( 'mouseUp', function () {
		console.log('changed');
		var object = transformControls.object;

		if ( object !== undefined ) {
	
			if ( ! objectPositionOnDown.equals( object.position ) ) {
				console.log('changed');
				editor.execute( new SetPositionCommand( object, object.position, new THREE.Vector2(convertCoordinate(object.position.x),convertCoordinate(object.position.y)) ,objectPositionOnDown ) );

			}
		}

		//controls.enabled = true;

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

			render();

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
		console.log(ondblclick);

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

		//	signals.objectFocused.dispatch( intersect.object );

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.



	// signals

	// signals.editorCleared.add( function () {

	// 	controls.center.set( 0, 0, 0 );
	// 	render();

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
			//	yourMesh.material.uniforms.yourUniform.value = whatever;
			//object.material.needsUpdate = true;

			object.material.uniforms.color.value = new THREE.Color(0x00ffff);
				//object.material

			}
			//if (object.type != 0 )
				transformControls.attach( object );

		}

		render();

	} );




	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.push( child );

		} );

	} );


	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			selectionBox.setFromObject( object );
			transformControls.update();

		}


		// if ( editor.helpers[ object.id ] !== undefined ) {

		// 	editor.helpers[ object.id ].update();

		// }

		render();

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

		object.traverse( function ( child ) {

			objects.splice( objects.indexOf( child ), 1 );

		} );

	} );





	signals.windowResize.add( function () {

		// TODO: Move this out?

		editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		editor.DEFAULT_CAMERA.updateProjectionMatrix();

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {
		console.log(showGrid)
		grid.visible = showGrid;
		render();

	} );



	signals.rendererChanged.add( function ( ) {

		render();

	} );





	function render() {
		//requestAnimationFrame(animate);
	//	console.log("renders")
		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();
		//console.log(editor.camera);
		renderer.render( scene, editor.camera);

		//if ( renderer instanceof THREE.RaytracingRenderer === false ) {

			renderer.render( sceneHelpers,  editor.camera );

		//}

	}

};
