# Update of the force-layout graph:

## In zoom_and_expand.js:

1.Add a dropdown box for selecting layer data to force;

2.Support re-force the new data when change time interval;

3.When hover on a node. Hide all the links except those related to this node;

4.Set force charge based on the layer to reduce the density of nodes(expecially when in deeper layer);

5.For sentiment_edge. Use “compute” to fill the link with gradient color
    (from red(-1< mean_sentiment <0) to green(0< mean_sentiment <1));
    
6.Fix the position of the graph when hovering on a node(by stop the force. Still can be dragged.)

7.Give each node a new attribute :"size" showing how many nodes in the same layer links to current node. 
    Used to depend the radius of the nodes.
    
## In graph.html:

1.Add a div for dropbox

## In style_graph.css:

1.Add css for dropbox
