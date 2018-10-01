Sidebar.Flows = function ( editor ) {

	var signals = editor.signals;
	var container = new UI.Panel();
    var flowHeaderRow = new UI.Row();
    var nodes = editor.graph.nodes;

    var from = new UI.Text('From').setWidth ( '70px' );
    var to = new UI.Text('To').setWidth ( '70px' );
    var volume = new UI.Text('Volume').setWidth ( '70px' );
    var cost = new UI.Text('Cost').setWidth ( '70px' );


    flowHeaderRow.add( from, to, volume, cost );
    container.add(flowHeaderRow);

    var parameters = new UI.Span();
    container.add(parameters);

    signals.refreshSidebarFlowsProperties.add(function(selectedObjs){
        
        parameters.clear();
		parameters.add(new UI.HorizontalRule());
        
        for( var flow of Object.values(selectedObjs)){

            var contentRow = new UI.Row();

            var from = new UI.Text(nodes[flow.from].name).setWidth ( '70px' );
            var to = new UI.Text( nodes[flow.to].name).setWidth ( '70px' );
            var volume = new UI.Text(Math.round10(flow.graphElement.volume,-4)).setWidth( '70px' );
            var cost = new UI.Text(Math.round10(flow.graphElement.cost,-4)).setWidth( '70px' );

            // var from = nodes[flow.from];
            // var to = nodes[flow.to];
            // var cost = flow.graphElement.cost;
            // var volume = flow.graphElement.volume;
            contentRow.add(from,to,volume,cost);
            parameters.add(contentRow);
       
            
            // console.log(object);



        }
        
    });

    return container;
};