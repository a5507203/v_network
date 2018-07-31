
Menubar.File = function ( editor ) {
	var signals = editor.signals;
	var NUMBER_PRECISION = 6;

	function parseNumber( key, value ) {

		return typeof value === 'number' ? parseFloat( value.toFixed( NUMBER_PRECISION ) ) : value;

	}

	//
	var postNetUrl = Config.host+'/networks';
	var submitResultUrl = Config.host+'/scores';
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

	// NEW GAME
	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'New Game' );
	option.onClick( function () {

		if ( confirm( 'Do you want to start a new game?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );


	// UPLOAD FILE
	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );
	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.fileLoader.loadFile( fileInput.files[ 0 ] );
		form.reset();

	} );

	var upload = new UI.Row();
	upload.setClass( 'option' );
	upload.setTextContent( 'Upload' );
	upload.onClick( function () {

		fileInput.click();


	} );
	options.add( upload );

	//Download
	var download = new UI.Row();
	download.setClass( 'option' );
	download.setTextContent( 'Download' );
	download.onClick( function () {
		var zip = new JSZip();

		var graphContents = editor.graph.toCsv();
		zip.file("nodes.csv", graphContents.nodes);
		//TODO TAKE OUT THE FLOW.CSV
		// zip.file("flows.csv", graphContents.flows);
		zip.file("networks.csv", graphContents.edges);
		zip.file("trips.csv", graphContents.trips);
		zip.generateAsync({type:"blob"})
		.then(function(content) {
			saveAs(content, "networks.zip");
		});

	} );
	options.add( download );



	//SUBMIT
	var submit = new UI.Row();
	submit.setClass( 'option' );
	submit.setTextContent( 'Submit' );
	submit.onClick( function () {
		
    	var graphContents = editor.graph.toCsv();
        userInfo = JSON.parse(getCookie('userInfo'));
     
		var networkInfo = {
			networkID: editor.currGame,
			userID:userInfo.id,
			nodes:graphContents.nodes,
			links:graphContents.edges,
			trips:graphContents.trips
		};
        httpPostAsync(submitResultUrl, networkInfo, function(res) {
			signals.readFlows.dispatch(res.flows);
			alert('congratulations, your score is '+ res.score);
	
        });
	} );
	options.add( submit );

	// PUBLISH
    var popupContainer = document.createElement('div');
    popupContainer.setAttribute('class','loginPanel');
    popupContainer.setAttribute('style','display:inline');

	var popupPanel = document.createElement('div');
    popupPanel.setAttribute('class','popupContainer');
    popupPanel.setAttribute('style','display:inline');
    popupContainer.appendChild(popupPanel);
    //popup Header
    var popupHeader = document.createElement('header');
    popupHeader.setAttribute('class','popupHeader');
    var headerTXT = document.createElement('label');
    headerTXT.innerHTML = 'Graph Info';
    popupHeader.appendChild(headerTXT);
    popupPanel.appendChild(popupHeader);
    //popup body
    var popupBody = document.createElement('div');
    popupBody.setAttribute('class','popupBody');
    popupPanel.appendChild(popupBody);

    //publish panel
    var publishPanel = document.createElement('div');
    publishPanel.setAttribute('class','user_login');
    popupBody.appendChild(publishPanel);
    var publishForm = document.createElement('form');
    publishPanel.appendChild(publishForm);
  
    
    var graphName = document.createElement('input');
    graphName.setAttribute('required','');
	graphName.setAttribute('type','text');
    graphName.setAttribute('name','graphName');
    graphName.setAttribute('placeholder','Graph Name');
    publishForm.appendChild(graphName);

    var level = document.createElement('select');
    level.setAttribute('required','');
	level.setAttribute('name','level');
	var easy = document.createElement('option');
	easy.value = 'easy';
    easy.innerHTML = 'Easy';
	level.appendChild(easy);
	var medium = document.createElement('option');
	medium.value = 'medium';
	medium.innerHTML = 'Medium';
	level.appendChild(medium);
	var difficult = document.createElement('option');
	difficult.value = 'difficult';
	difficult.innerHTML = 'Difficult';
	level.appendChild(difficult);
    // level.setAttribute('type','text');
    // level.setAttribute('placeholder','Level');
    publishForm.appendChild(level);


	var linkAddedableBox = document.createElement('input');
	linkAddedableBox.setAttribute('type','checkbox');
	linkAddedableBox.setAttribute('value','linkButton');
	linkAddedableBox.setAttribute('name','linkOption');
	//  <label for="scales">Scales</label>

	var labelforlink = document.createElement('label');
	labelforlink.innerHTML = 'Allow to add links';
	labelforlink.setAttribute('for','linkButton');
	publishForm.appendChild(labelforlink);
	publishForm.appendChild(linkAddedableBox);

	var publishButtonGroup = document.createElement('div');
    publishButtonGroup.setAttribute('class','action_btns');
    publishForm.appendChild(publishButtonGroup);

    var confirmButton = document.createElement('button');
    confirmButton.setAttribute('class','one_half');
    confirmButton.setAttribute('type','submit');
    confirmButton.innerHTML = 'Confirm';
	publishForm.onsubmit = function(e){
		e.preventDefault();
    	var graphContents = editor.graph.toCsv();
        userInfo = JSON.parse(getCookie('userInfo'));
        userId = userInfo.id;
		var linkAddedable = 0; 
		if (publishForm.elements.linkOption.checked) {
			linkAddedable = 1;
		}
		var networkInfo = {
			networkName: publishForm.elements.graphName.value,
			author:userInfo.id,
			nodes:graphContents.nodes,
			links:graphContents.edges,
			linkAddedable:linkAddedable,
			trips:graphContents.trips,
			level: publishForm.elements.level.value
		};
        httpPostAsync(postNetUrl, networkInfo, function(res) {
            if(res.status == 401) {
                alert('invalid password');
            }
            else{
                document.body.removeChild(popupContainer);
            }
        });
	};
    publishButtonGroup.appendChild(confirmButton);
	
    var cancelButton = document.createElement('button');
    cancelButton.setAttribute('class','one_half last');
    cancelButton.innerHTML = 'Cancel';
    publishButtonGroup.appendChild(cancelButton);
	cancelButton.onclick = function(){
		document.body.removeChild(popupContainer);

	};
    publishPanel.appendChild(document.createElement('br'));
    publishPanel.appendChild(document.createElement('br'));
    publishPanel.appendChild(document.createElement('br'));

	var publish = new UI.Row();
	publish.setClass( 'option' );
	publish.setTextContent( 'Publish' );
	publish.onClick( function () {
		document.body.appendChild(popupContainer);
	} );


	options.add( publish );

	signals.isAdmin.add(function(bool){
		if(bool) publish.setDisplay( '' );
		else publish.setDisplay( 'none' );
		
	});
	
	return container;



};

function save( blob, filename ) {

	link.href = URL.createObjectURL( blob );
	link.download = filename || 'data.json';
	link.click();

	// URL.revokeObjectURL( url ); breaks Firefox...

}