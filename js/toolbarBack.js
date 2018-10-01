



var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'toolbar' );

	var buttons = new UI.Panel();
	container.add( buttons );

	// animationMode / editMode / scale

	var animationMode = new UI.Button( 'Animation Mode' );
	animationMode.dom.className = 'Button selected';
	animationMode.onClick( function () {
        signals.modeChanged.dispatch('AnimationMode');
	

	} );
	buttons.add( animationMode );

	var editMode = new UI.Button( 'Edit Mode' );
	editMode.onClick( function () {
        signals.modeChanged.dispatch('EditMode');

	} );
	buttons.add( editMode );

	

	signals.modeChanged.add( function ( mode ) {

		animationMode.dom.classList.remove( 'selected' );
		editMode.dom.classList.remove( 'selected' );


		switch ( mode ) {

			case 'AnimationMode': animationMode.dom.classList.add( 'selected' ); break;
			case 'EditMode': editMode.dom.classList.add( 'selected' ); break;
		
		}

	} );

	return container;

};