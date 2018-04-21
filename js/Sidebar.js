var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	var signals = editor.signals;
	container.setId( 'sidebar' );


	var animationModeTab = new UI.Text( 'ANIMATION' ).onClick( onClick );
	var editModeTab = new UI.Text( 'EDIT' ).onClick( onClick );
	var settingsTab  = new UI.Text( 'SETTINGS' ).onClick( onClick );
	
	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( animationModeTab, editModeTab, settingsTab );
	container.add( tabs );

	var animationMode = new UI.Span().add(
		new Sidebar.Properties( editor )
	);
	container.add( animationMode );


	var editMode = new UI.Span().add(
		new Sidebar.History( editor ),
		new Sidebar.AddElements( editor ),
		new Sidebar.Properties( editor )
	);
	container.add( editMode );


	var settings = new UI.Span().add(
		new Sidebar.Settings( editor )

	);
	container.add( settings );

	

	function onClick( event ) {

		select( event.target.textContent );

	}

	function select( section ) {

		animationModeTab.setClass( '' );
		editModeTab.setClass( '' );
		settingsTab.setClass( '' );

		animationMode.setDisplay( 'none' );
		editMode.setDisplay( 'none' );
		settings.setDisplay( 'none' );

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
			case 'SETTINGS':
				settingsTab.setClass( 'selected' );
				settings.setDisplay( '' );
				break;
		}

	}

	select( 'ANIMATION' );
	return container;

};
