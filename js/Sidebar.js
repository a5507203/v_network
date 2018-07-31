var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	var signals = editor.signals;
	container.setId( 'sidebar' );


	var animationModeTab = new UI.Text( 'ANIMATION' ).onClick( onClick );
	var editModeTab = new UI.Text( 'EDIT' ).onClick( onClick );
	var newGameTab  = new UI.Text( 'NEW GAME' ).onClick( onClick );
	
	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( newGameTab, animationModeTab, editModeTab );
	container.add( tabs );

	var newGame = new UI.Span().add(
		new Sidebar.Settings( editor )

	);
	container.add( newGame );


	var animationMode = new UI.Span().add(
		//new Sidebar.Properties( editor )
	);
	container.add( animationMode );


	var editMode = new UI.Span().add(
		new Sidebar.History( editor ),
		new Sidebar.Invoice( editor ),
		new Sidebar.AddElements( editor ),
		new Sidebar.Properties( editor )

	);
	container.add( editMode );




	

	function onClick( event ) {

		select( event.target.textContent );

	}

	function select( section ) {

		animationModeTab.setClass( '' );
		editModeTab.setClass( '' );
		newGameTab.setClass( '' );

		animationMode.setDisplay( 'none' );
		editMode.setDisplay( 'none' );
		newGame.setDisplay( 'none' );

		switch ( section ) {
			case 'ANIMATION':
				animationModeTab.setClass( 'selected' );
				signals.modeChanged.dispatch('AnimationMode');
				animationMode.setDisplay( '' );

				break;
			case 'EDIT':
				editModeTab.setClass( 'selected' );
				signals.modeChanged.dispatch('EditMode');
				editMode.setDisplay( '' );
				break;
			case 'NEW GAME':
				newGameTab.setClass( 'selected' );
				newGame.setDisplay( '' );
				break;
		}

	}

	select( 'NEW GAME' );
	return container;

};
