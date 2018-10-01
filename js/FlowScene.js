var FlowScene = function (flowScene, editor, viewport) {

    var render = viewport;
    var signals = editor.signals;
    var container  = flowScene.userData.element;
    var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
    var camera = flowScene.userData.camera;
	var selectedObjs = {};
    var objects = flowScene.children;



	var title = new UI.Row().setTop( '10px' );
	title.dom.style['text-align']='center';
	var nameText = new UI.Text( 'UE traffic assignment' );
	title.add(nameText);


	var infoContainer = new UI.Panel();
	infoContainer.setId( 'info' );
	infoContainer.setPosition( 'absolute' );
	infoContainer.setRight( '10px' );
	infoContainer.setBottom( '10px' );
	infoContainer.setFontSize( '12px' );
	
	var tsttText = new UI.Text( '0' ).setMarginLeft( '6px' );
	infoContainer.add( new UI.Text( 'TSTT: ' ), tsttText, new UI.Break() );
	container.appendChild(title.dom );


	signals.tsttChanged.add(function(value){

		tsttText.setValue(value);

	});

	container.appendChild(infoContainer.dom);

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
			
		
			var intersects = getIntersects( onUpPosition, flowScene.children );

            handleSelected(intersects);

		

		}

	}
    function handleSelected(intersects){


			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;
				
				select( object );

				

			} else {

				select( null );

			}
    }

    function select (object){

        if(object == null){
            deSelect(object);
		}
    

        else{
            if( object.name == 'flow') {
                
                if(selectedObjs[object.uuid] == undefined){

                    object.material.uniforms.color.value = new THREE.Color(0x0000ff);
                    object.material.needsUpdate = true;
                    selectedObjs[object.uuid] = object;
                }
                else{
                     deSelect(object);
                }
             
            }
        }
        signals.refreshSidebarFlowsProperties.dispatch(selectedObjs);
        render(	);
    }
    function deSelect (object){

        if (object == null){

            for ( var selected of Object.values(selectedObjs)){
                console.log(selected);
                selected.material.uniforms.color.value = selected.color;
                selected.material.needsUpdate = true;
                delete selectedObjs[selected.uuid];
            }
        } 
        else{
            object.material.uniforms.color.value = object.color;
            object.material.needsUpdate = true;
            delete selectedObjs[object.uuid];

        }

    }

	signals.readFlows.add(function(){
		deSelect(null);
		signals.refreshSidebarFlowsProperties.dispatch(selectedObjs);
	});


	function onMouseDown( event ) {

		event.preventDefault();

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

    	
};