var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	var signals = editor.signals;
	container.setId( 'sidebar' );


	var newGameTab  = new UI.Text( 'NEW GAME' ).onClick( onClick );
	var flowTab = new UI.Text( 'FLOWS' ).onClick( onClick );
	var editModeTab = new UI.Text( 'EDIT' ).onClick( onClick );
	var invoiceTab = new UI.Text( 'BUDGET' ).onClick( onClick );
	var historyTab = new UI.Text( 'HISTORY' ).onClick( onClick );

	
	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( newGameTab, flowTab, editModeTab,invoiceTab,historyTab);
	container.add( tabs );

	var newGame = new UI.Span().add(
		new Sidebar.Settings( editor )

	);
	container.add( newGame );


	var flow = new UI.Span().add(
		new Sidebar.Flows( editor )
	);
	container.add( flow );


	var editMode = new UI.Span().add(
		// new Sidebar.History( editor ),
		// new Sidebar.Invoice( editor ),
		new Sidebar.AddElements( editor ),
		new Sidebar.Properties( editor )

	);
	container.add( editMode );

	var invoice = new UI.Span().add(
		new Sidebar.Invoice( editor )
	);
	container.add( invoice );

	var history = new UI.Span().add(
		new Sidebar.History( editor )
	);
	container.add( history );


	

	function onClick( event ) {

		select( event.target.textContent );

	}

	function select( section ) {

		flowTab.setClass( '' );
		editModeTab.setClass( '' );
		newGameTab.setClass( '' );
		invoiceTab.setClass( '' );
		historyTab.setClass( '' );

		flow.setDisplay( 'none' );
		editMode.setDisplay( 'none' );
		newGame.setDisplay( 'none' );
		invoice.setDisplay( 'none' );
		history.setDisplay( 'none' );

		switch ( section ) {
			case 'FLOWS':
				flowTab.setClass( 'selected' );
				// signals.modeChanged.dispatch('flow');
				flow.setDisplay( '' );

				break;
			case 'EDIT':
				editModeTab.setClass( 'selected' );
				// signals.modeChanged.dispatch('EditMode');
				editMode.setDisplay( '' );
				break;
			case 'NEW GAME':
				newGameTab.setClass( 'selected' );
				newGame.setDisplay( '' );
				break;
			case 'BUDGET':
				invoiceTab.setClass( 'selected' );
				invoice.setDisplay( '' );
				break;
			case 'HISTORY':
				historyTab.setClass( 'selected' );
				history.setDisplay( '' );
				break;
		}

	}

	select( 'NEW GAME' );
	return container;

};
