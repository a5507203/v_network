
Menubar.File = function ( editor ) {

	var NUMBER_PRECISION = 6;

	function parseNumber( key, value ) {

		return typeof value === 'number' ? parseFloat( value.toFixed( NUMBER_PRECISION ) ) : value;

	}

	//

	var config = editor.config;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Menu' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// New

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'New Game' );
	option.onClick( function () {

		if ( confirm( 'Do you want to start a new game?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );

	//Download
	var download = new UI.Row();
	download.setClass( 'option' );
	download.setTextContent( 'Download' );
	download.onClick( function () {

		if ( confirm( 'Do you want to start a new game?' ) ) {

			editor.clear();

		}

	} );
	options.add( download );

	//options.add( new UI.HorizontalRule() );


	
	return container;

};