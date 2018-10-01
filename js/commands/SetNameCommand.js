var SetNameCommand = function ( object, newName ) {

	Command.call( this );

	this.type = 'SetNameCommand';
	this.name = 'Set node name from '+ object.graphElement.name + ' to ' + newName;
	// this.updatable = true;

	this.object = object;
	// this.attributeName = attributeName;
  
    this.oldName = object.graphElement.name;
	this.newName = newName;
    //   console.log(this.newName,this.oldName,newName)

};

SetNameCommand.prototype = {

	execute: function () {

		//this.object[ this.attributeName ] = this.newName;
		//this.editor.signals.nameChanged.dispatch( this.object );
        this.editor.setNodeName(this.object, this.newName);
		// this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {
        console.log(this.oldName);
        this.editor.setNodeName(this.object, this.oldName);
		//this.object[ this.attributeName ] = this.oldValue;
		//this.editor.signals.objectChanged.dispatch( this.object );
		// this.editor.signals.sceneGraphChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};