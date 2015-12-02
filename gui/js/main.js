/* DAGitty - a browser-based software for causal modelling and analysis
*   Copyright (C) 2010,2011 Johannes Textor
* 
*   This program is free software; you can redistribute it and/or
*   modify it under the terms of the GNU General Public License
*   as published by the Free Software Foundation; either version 2
*   of the License, or (at your option) any later version.
* 
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
* 
*   You should have received a copy of the GNU General Public License
*   along with this program; if not, write to the Free Software
*   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA. */

var GUI = {
	view_mode : "DAG",
	highlight_causal : true,
	highlight_biasing : true,
	highlight_ancestors : true,
	highlight_puredirect : false,
	allow_intermediate_adjustment : true,
	activate_path_style : function( s, b ){
		var sty = DAGitty.stylesheets.default.style
		if( b ) {
			if(sty[s+"path_inactive"] ){
				sty[s+"path"] = sty[s+"path_inactive"];
				delete sty[s+"path_inactive"];
			}
			displayShow("legend_"+s);
		} else {
			sty[s+"path_inactive"] = sty[s+"path"];
			delete sty[s+"path"];
			displayHide("legend_"+s);
		}
		DAGittyControl && DAGittyControl.redraw();
	},
	activate_node_style : function( s, b ){
		var sty = DAGitty.stylesheets.default.style
		if( b ) {
			if(sty[s+"node_inactive"] ){
				sty[s+"node"] = sty[s+"node_inactive"];
				delete sty[s+"node_inactive"];
			}
		} else {
			sty[s+"node_inactive"] = sty[s+"node"];
			delete sty[s+"node"];
		}
	},
	set_highlight_biasing : function( b ){
		this.activate_path_style( "biasing", b );
	},
	set_highlight_causal : function( b ){
		this.activate_path_style( "causal", b );
	},
	set_highlight_puredirect : function( b ){
		this.activate_path_style( "puredirect", b );
	},
	set_highlight_ancestors : function( b ){
		this.highlight_ancestors = b;
		["confounder","anexposure","anoutcome"].each(function(n){
			this.activate_node_style( n, b );
		},this);
		b ? displayShow("legend_ancestors") : displayHide("legend_ancestors");
		DAGittyControl && DAGittyControl.redraw();
	},
	set_view_mode : function( vm ){
		view_mode = vm;
		DAGittyControl && DAGittyControl.setViewMode( view_mode );
	},
	set_style : function( s ){
		DAGitty.stylesheets.default = DAGitty.stylesheets[s]
		var sty = DAGitty.stylesheets.default.style
		$("highlight_ancestral").checked = typeof(sty["confoundernode_inactive"]) === "undefined";
		$("highlight_ancestral").checked ? displayShow("legend_ancestors") : displayHide("legend_ancestors");
		
		$("highlight_causal").checked = typeof(sty["causalpath_inactive"]) === "undefined";
		$("highlight_causal").checked ? displayShow("legend_causal") : displayHide("legend_causal");
		
		$("highlight_biasing").checked = typeof(sty["biasingpath_inactive"]) === "undefined";
		$("highlight_biasing").checked ? displayShow("legend_biasing") : displayHide("legend_biasing");
		
		$("highlight_puredirect").checked = typeof(sty["puredirectpath_inactive"]) === "undefined";
		["biasingpath","causalpath","exposure","latentnode","lnode","mnode","other",
			"outcome","rnode","adjustednode"].each(function(n){
			$("li"+n).src="images/legend/"+s+"/"+n+".png"
		},this);
		DAGittyControl.setStyle( s )
	}
};


/* some convenience functions */

function log(a) {
	if( console && console.log  ){
		console.log(a);
	}
}

function displayArrow( id, on ){
	if( $("a_"+id) ){
		$("a_"+id).src =  "images/arrow-" + (on?"down":"right") + ".png";
	}
}
function displayShow( id ){
	var e = $(id);
	if( !e ){ 
		return;
	}
	if( e.tagName == "SPAN" ){
		e.style.display = "inline";
	} else {
		e.style.display = "block";
	}
	displayArrow( id, true );
}
function displayHide( id ){
	var e = $(id);
	if( !e ){ 
		return;
	}
	e.style.display = "none";
	displayArrow( id, false );
}
function displayToggle( id ){
	var on = true;
	if( $(id).style.display == "block" ){
		$(id).style.display = "none";
		on = false;
	} else {
		$(id).style.display = "block";
	}
	displayArrow( id, on );
}

function menuOpen( id ){
	for( var i = 0 ; i < GUI.menus.length ; i ++ ){
		if( GUI.menus[i] != id ){
			displayHide( "menu_"+GUI.menus[i] )
		} else {
			displayShow( "menu_"+id )
		}
	}
}
function menuToggle( id ){
	for( var i = 0 ; i < GUI.menus.length ; i ++ ){
		if( GUI.menus[i] != id ){
			displayHide( "menu_"+GUI.menus[i] )
		} else {
			displayToggle( "menu_"+id )
		}
	}
}

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function msg( t ){
	DAGittyControl.getView().openAlertDialog( t );
}

function how( t ){
	msg( t );
	displayHide('menu_howto')
}

/* now to the real stuff */

function setsToHTML( sets ){
	if( sets.length > 0 ){
		var msas_html = [];
		for( var i = 0 ; i < sets.length ; i ++ ){
			msas_html[i] = "{";
			var ids = sets[i].pluck('id').sort();
			for( var j = 0 ; j < ids.length ; j ++ ){
				if( j > 0 ){
					msas_html[i] += ", ";
				}
				if( Model.dag.isAdjustedNode( ids[j] ) ){
					msas_html[i] += "<strong>"+ids[j]+"</strong>";
				} else {
					msas_html[i] += ids[j];
				}
			}
			msas_html[i] += "}";
		} 
		return "<ul><li>"+msas_html.sort().join("</li><li>")+"</li></ul>";
	} else {
		return "";
	}
}

function causalEffectEstimates(){
	switch( $("causal_effect_kind").value ){
		case "adj_total" :
			displayAdjustmentInfo("total"); break
		case "adj_direct" :
			displayAdjustmentInfo("direct"); break
		case "instrument" :
			displayInstrumentInfo(); break
	}
}

/** Updates the "adjustment" UI component. The variable "kind" can be one of
	"total" or "direct". */
	
function msasToHtml( msas ){
	if( msas.length > 0 ){
		var msas_html = [];
		for( var i = 0 ; i < msas.length ; i ++ ){
			msas_html[i] = "";
			var ids = msas[i].pluck('id').sort();
			for( var j = 0 ; j < ids.length ; j ++ ){
				if( j > 0 ){
					msas_html[i] += ", ";
				}
				if( Model.dag.isAdjustedNode( ids[j] ) ){
					msas_html[i] += "<strong>"+ids[j]+"</strong>";
				} else {
					msas_html[i] += ids[j];
				}
			}
		} 
		return "<ul><li>"+msas_html.sort().join("</li><li>")+"</li></ul>";
	} else {
		return "";
	}
}

function displayAdjustmentInfo( kind ){	
	var adjusted_nodes = Model.dag.vertices.values().
		findAll(Model.dag.isAdjustedNode, Model.dag);
	var html_adjustment = "";
	if( kind != "total" ){
		kind = "direct";
	}
	if( adjusted_nodes.length > 0 ){
		html_adjustment = " containing "+adjusted_nodes.pluck('id').sort().join(", ");
	}
	if( Model.dag.getSources().length==0 || Model.dag.getTargets().length==0 ){
		$("causal_effect").innerHTML = "<p>Exposure and/or outcome not defined.</p>"
		return
	}
	
	var showMsas = function( t, msas, html_a ){
		if( msas.length == 1 && msas[0].length == 0 ){
			$("causal_effect").innerHTML = 
				"<p>No adjustment is necessary to estimate the "+t+" effect of "+
					Model.dag.getSources().pluck('id').join(",") +
					" on " + Model.dag.getTargets().pluck('id').join(",") + ".</p>"
			return
		}
		var msas_html = msasToHtml( msas );
		if( msas_html ){
			$("causal_effect").innerHTML = 
			"<p>Minimal sufficient adjustment sets "+html_a+" for estimating the "+t+" effect of "
			+ Model.dag.getSources().pluck('id').join(",") 
			+ " on " + Model.dag.getTargets().pluck('id').join(",") + ": " + msas_html;
		} else {
			$("causal_effect").innerHTML 
			= "<p>The "+t+" effect cannot be estimated by covariate adjustment.</p>";
		}
	};
	
	if( kind == "total" ){
		if( GraphAnalyzer.violatesAdjustmentCriterion( Model.dag ) ){
			$("causal_effect").innerHTML 
			= "<p>The total effect cannot be estimated due to adjustment for an intermediate or a descendant of an intermediate.</p>";
		} else {

			showMsas( "total",
				GraphAnalyzer.listMsasTotalEffect( Model.dag ), html_adjustment );
		}
	}
	
	if( kind == "direct" ){
		showMsas( "direct",
				GraphAnalyzer.listMsasDirectEffect( Model.dag ), html_adjustment );
	}
}


function ivsToHtml( ivs ){
	if( ivs.length > 0 ){
		var ivs_html = [];
		for( var i = 0 ; i < ivs.length ; i ++ ){
			ivs_html[i] = ivs[i][0].id
			if( ivs[i][1].length > 0 ){
				ivs_html[i] += " | "+ivs[i][1].pluck('id').join(', ');
			}
		} 
		return "<ul><li>"+ivs_html.sort().join("</li><li>")+"</li></ul>";
	} else {
		return "";
	}
}

function displayInstrumentInfo(){
	if( Model.dag.getSources().length != 1 || 
		Model.dag.getTargets().length != 1 ){
		$("causal_effect").innerHTML = "<p>Instrumental variable identification is only supported for a single exposure and a single outcome.</p>"
		return
	}
	var ivs = GraphAnalyzer.conditionalInstruments( Model.dag )
	if( ivs === false ){
		$("causal_effect").innerHTML = "<p>Instrumental variable identification is not supported for this kind of DAG.</p>"
		return
	}
	if( ivs.length == 0 ){
		$("causal_effect").innerHTML = "<p>There are no instruments or conditional instruments in this DAG.</p>"
		return
	}
	$("causal_effect").innerHTML = "<p>Instruments and conditional instruments:</p>"
		+ ivsToHtml( ivs )
}

function displayImplicationInfo( full ){
	var imp;
	var more_link = false;
	if( full ){
		imp = GraphAnalyzer.listMinimalImplications( Model.dag );
	}
	else{
		imp = GraphAnalyzer.listMinimalImplications( Model.dag , 10 );
	}
	if( imp.length > 0 ){
		var imp_html = "<p>The model implies the following conditional independences: </p><ul><li>";
		var n = 0;
		for( var i = 0 ; i < imp.length ; i ++ ){
			for( j = 0 ; j < imp[i][2].length ; j ++ ){
				if( full || ++n < 10 ){
					if( i > 0 || j > 0 ) imp_html += "</li><li>";
					imp_html += imp[i][0]+" &perp; "+imp[i][1];
					if( imp[i][2][j].length > 0 ){
						imp_html += " | "+imp[i][2][j].pluck('id').sort().join(", ");
					} 
				}  else {
					more_link = true;
				}
			}
		}
		imp_html += "</ul>";
		$("testable_implications").innerHTML = imp_html +
			(more_link?'<p><a href="javascript:void(0)" onclick="displayImplicationInfo( true )">Show all ...</a></p>':'')+
			('<p><a href="javascript:void(0)" onclick="exportImplicationTests()">Export R code</a></p>');
	} else {
		$("testable_implications").innerHTML = 
		"<p>Either the model does not imply any conditional independencies "
		+" or the implied ones are untestable due to unobserved variables.</p>";
	}
}

function exportImplicationTests(){
	DAGittyControl.getView().openHTMLDialog( 
		"<textarea style=\"width:80%\" rows=\"10\">"+
		 GraphSerializer.toImplicationTestRCode( Model.dag, 1000 ) +
		"</textarea>", "OK"
	)
}

/** updates the "summary" component */ 
function displayGeneralInfo(){
	var cycle = Model.dag.containsCycle();
	if( cycle ){
		displayShow("info_cycle");
		displayHide("info_summary");
		$("info_cycle").innerHTML = "<p><b>Model contains cycle: "+cycle+"</b></p>";
	} else {
		if ( _.some(Model.dag.getEdges(), function(e) { return e.directed == Graph.Edgetype.Undirected; } ) )
			cycle = GraphAnalyzer.containsSemiCycle(Model.dag);
		if (cycle) {
			displayShow("info_cycle");
			displayHide("info_summary");
			$("info_cycle").innerHTML = "<p><b>Model contains semi-cycle: "+cycle+"</b></p>";
		} else {
			displayHide("info_cycle");
			displayShow("info_summary");
			$("info_exposure").innerHTML = Model.dag.getSources().pluck('id').join(",");
			$("info_outcome").innerHTML = Model.dag.getTargets().pluck('id').join(",");
			$("info_covariates").innerHTML = Model.dag.getNumberOfVertices()-Model.dag.getSources().length
			-Model.dag.getTargets().length;
			$("info_frontdoor").innerHTML = Model.dag.countPaths();
			// $("info_backdoor").innerHTML = dag_ancestor_pair_graph.countPaths();      
		}
	}
	/*$("path_information").innerHTML = nl2br("Closed paths:<br/>"+dag_ancestor_graph.listClosedPaths()
	*         + "<br/><br/>Open paths:<br/>"+dag_ancestor_pair_graph.listPathPairs(),true);*/
}

function loadDAGFromTextData(){
	Model.dag = GraphParser.parseGuess( $("adj_matrix").value );
	if( !Model.dag.hasCompleteLayout() ){
		var layouter = new GraphLayouter.Spring( Model.dag );
		layouter.layout();
	}
	DAGittyControl.setGraph( Model.dag  );
	displayHide("model_refresh");
	$("adj_matrix").style.backgroundColor="#fff";
}

function generateSpringLayout(){
	var layouter = new GraphLayouter.Spring( Model.dag );
	Model.dag.edges.each(function(e){delete e["layout_pos_x"];delete e["layout_pos_y"]})
	layouter.layout();
	DAGittyControl.setGraph( Model.dag ); // trigges to refresh the rendering
};

function loadExample( nr ){
	$("adj_matrix").value = examples[parseInt(nr)].v+"\n\n"+examples[parseInt(nr)].e;
	loadDAGFromTextData();
}

function newModel(){
	DAGittyControl.getView().openPromptDialog(
		"Please enter name of exposure variable","", newModel2 );
}
function newModel2(ename){
	if( ename === null ){ return false; }
	ename = (""+ename).strip()
	if( ename == "" ){ return false; }
	DAGittyControl.getView().openPromptDialog(
		"Please enter name of outcome variable","",function(s){ 
			newModel3(ename,s) } )
	return true;
}
function newModel3(ename,oname){
	if( oname == null ){ return false; }
	oname = (""+oname).strip()
	if( oname == "" || ename == oname ){ return false; }
	$("adj_matrix").value = ename+" E @0,0\n"+oname+" O @1,1\n\n"+ename+" "+oname
	loadDAGFromTextData()
	DAGittyControl.getView().closeDialog()
}

function supportsSVG() {
	return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ||
	document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.0");
};

function exportPDF(){
	if( supportsSVG() ){
		$("exportformsvg").value = $("canvas").innerHTML;
		$("exportform").action = "http://www.dagitty.net/pdf/batik-pdf.php";
		$("exportform").submit();
	}
}

function exportJPEG(){
	if( supportsSVG() ){
		$("exportformsvg").value = $("canvas").innerHTML;
		$("exportform").action = "http://www.dagitty.net/pdf/batik-jpeg.php";
		$("exportform").submit();
	}
}

function exportPNG(){
	if( supportsSVG() ){
		$("exportformsvg").value = $("canvas").innerHTML;
		$("exportform").action = "http://www.dagitty.net/pdf/batik-png.php";
		$("exportform").submit();
	}
}

function exportSVG(){
	if( supportsSVG() ){
		$("exportformsvg").value = $("canvas").innerHTML;
		$("exportform").action = "http://www.dagitty.net/pdf/svg.php";
		$("exportform").submit();
	}
}

function hostName(){
	switch( window.location.hostname ){
		case "dagitty.net":
			return "dagitty.net";
		case "dagitty.concebo.eu":
			return "dagitty.concebo.eu";
		case "www.dagitty.net":
			return "www.dagitty.net";
	}
	return "dagitty.net";
}

/** Dialogues for online model storage */

function networkFailMsg(){
	msg(
	 "A network error occurred when trying to perform this function. "+
	 "If you are using a downloaded DAGitty version, this is likely "+
	 "due to Browser security settings. Try again using the online "+
	 "version of DAGitty." )
}

function getModelIdFromURL( url ){
	return url.substring(url.indexOf('.net/m')+'.net/m'.length)
}


function saveOnlineForm(){
	if( typeof grecaptcha === "undefined" ){
		networkFailMsg(); return
	}
	new Ajax.Request("http://"+hostName()+"/dags/save-form.php",
		{
			method:'post',
			onFailure: networkFailMsg,
			onSuccess: function( t ) { 
				if( t.readyState==4 && t.status == 0 ){
					networkFailMsg(); return
				}
				DAGittyControl.getView().openHTMLDialog( t.responseText )
				GUI.recaptchaid = grecaptcha.render( "recaptcha",
					{ sitekey : "6LdFd_sSAAAAAGyO4FTNjvok0sKA9Bm_sShVsU9F",
					  theme: "white"
					}
				);
			}
		}
	);
}

function validateCaptcha()
{
	new Ajax.Request("http://"+hostName()+"/dags/recaptcha-validate-v2.php",{
		method: "POST",
		parameters: { 
			"g-recaptcha-response" : grecaptcha.getResponse(),
		},
		onSuccess : function(t){
			if( t.readyState==4 && t.status == 0 ){
				networkFailMsg(); return
			}
			if( t.responseText == "fail" ){
				$("captcha_status").innerHTML = "You did not solve the CAPTCHA. Please try again.";
				grecaptcha.reset();
			} else {
				saveOnline( t.responseText );
			}
		}
	} );
}

function saveOnlineValidate(){
	if( $('modelsavefrm_name').value.length < 3 ){
		$('modelsavefrm_name_err').innerHTML = "Please enter a title!"
		return false;
	}
	validateCaptcha();
}

function saveOnline( secret ){
	new Ajax.Request("http://"+hostName()+"/dags/save.php",
			{
				method:'post',
				parameters: { dag: Model.dag.toString(),
						email: $('modelsavefrm_email').value,
						name: $('modelsavefrm_name').value,
						desc: $('modelsavefrm_desc').value,
						secret : secret
				},
				onFailure: networkFailMsg,
				onSuccess: function( t ) { 
					DAGittyControl.getView().openHTMLDialog( t.responseText, "OK" )
					Model.uniqid = /\"https?:\/\/dagitty.net\/m([^"]+)\"/g.exec(t.responseText)[1];
				}
			}
		);
}

function updateOnline( id, pw ){
	new Ajax.Request("http://"+hostName()+"/dags/update.php",
		{
			method:'post',
			parameters: { id:id, pw:pw, dag:Model.dag.toString() },
			onFailure: networkFailMsg,
			onSuccess: function( t ) {
				if( t.readyState==4 && t.status == 0 ){
					networkFailMsg(); return
				}
				msg( t.responseText )
			}
		}
	);
}
function updateOnlineForm2( url ){
	var mdlid = getModelIdFromURL( url )
	DAGittyControl.getView().openPromptDialog( 
		"Please enter the password", "", 
		function(pw){ updateOnline( mdlid, pw ) } )
}
function updateOnlineForm(){
	DAGittyControl.getView().openPromptDialog( 
		"Please enter the model URL", "dagitty.net/m"+(Model.uniqid||""), 
		updateOnlineForm2 )
}

function deleteOnline( id, pw ){
	new Ajax.Request("http://"+hostName()+"/dags/delete.php",
		{
			method:'post',
			parameters: { id:id, pw:pw },
			onFailure: networkFailMsg,
			onSuccess: function( t ) {
				if( t.readyState==4 && t.status == 0 ){
					networkFailMsg(); return
				}
				msg( t.responseText )
			}	
		}
	);
}
function deleteOnlineForm2( url ){
	var mdlid = getModelIdFromURL( url )
	DAGittyControl.getView().openPromptDialog( 
		"Please enter the password", "", 
		function(pw){ deleteOnline( mdlid, pw ) } )
}
function deleteOnlineForm( id, pw ){
	DAGittyControl.getView().openPromptDialog( 
		"Please enter the model URL", "dagitty.net/m"+(Model.uniqid||""), deleteOnlineForm2 )
}

function loadOnline( url ){
	var graphid = getModelIdFromURL( url )
	new Ajax.Request("http://"+hostName()+"/dags/load.php",
		{
			method:'post',
			parameters: { id:graphid },
			onFailure: networkFailMsg,
			onSuccess: function( t ) { 
				if( t.readyState==4 && t.status == 0 ){
					networkFailMsg(); return
				}
				DAGittyControl.getView().closeDialog()
				if( t.responseText ){
					$("adj_matrix").value = B64.decode( t.responseText )
					Model.uniqid=graphid
					loadDAGFromTextData()
				} else {
					msg("model not found!")
				}
			}
		}
	);
}

function loadOnlineForm(){
	DAGittyControl.getView().openPromptDialog(
		"Enter the URL","dagitty.net/mVpq3",loadOnline)
}