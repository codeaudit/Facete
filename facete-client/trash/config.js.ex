/**
 * This file contains basic configuration for the spatial semantic browser SemMap.
 * 
 *
 * TODO: We need to be able to deal with mulitiple configs at once; even multiple configs per graph!
 */
(function() {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
	var config = Namespace("org.aksw.ssb.config");
	

	/*
	 * Sparql Endpoint Configuration
	 * 
	 * sparqlServiceUri:      The target SPARQL endpoint
	 * sparqlProxyServiceUri: Optional. If given, requests to the
	 *                        target endpoint are made via the proxy.
	 * sparqlProxyParamName:  The query string parameter name to be used
	 *                        in proxy requests
	 */
	config.sparqlServiceUri = "http://localhost/sparql";	
	config.sparqlProxyServiceUri = "lib/SparqlProxyPHP/current/sparql-proxy.php";
	config.sparqlProxyParamName = "service-uri";
	

	/*
	 * Quad Tree Configuration
	 * 
	 * maxTileItemCount:   Maximum allowed number of items per tile.
	 * maxGlobalItemCount: If there is globally less-equal this number of items,
	 *                     do not use tiles.
	 */
	config.quadTree = {
			maxTileItemCount: 50,
			maxGlobalItemCount: 200
	};


	/*
	 * Configurations of the icons shown on the map
	 */
	config.markerUrlDefault = "src/main/resources/images/org/openclipart/people/mightyman/map-marker-blue.gif";
	config.markerUrlSelected = "src/main/resources/images/org/openclipart/people/mightyman/map-marker-orange.gif";

	
	/*
	 * These settings are for the FP7 project partners dataset
	 * 
	 * typeStr:    The URI of the class whose instances are of interest
	 * geoPathStr: The path from the instances to the geographic resources
	 * 
	 */
	var typeStr = "http://ex.org/ontology/Project";
	var geoPathStr = "http://ex.org/ontology/partner http://ex.org/ontology/address http://ex.org/ontology/city";


	
	/*
	 * Configuration of some parameters based on typeStr and geoPathStr.
	 *  
	 */
	var s = sparql.Node.v("s");
	var a = sparql.Node.uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
	var type = sparql.Node.uri(typeStr);
	var driverElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, a, type)]);
	
	var driver = new facets.ConceptInt(driverElement, s);
	var pathManager = new facets.PathManager("s");

	
	config.driver = driver; 
	config.navigationPath = null;
	config.geoPath = facets.Path.fromString(geoPathStr);
	config.pathManager = pathManager;


})();
