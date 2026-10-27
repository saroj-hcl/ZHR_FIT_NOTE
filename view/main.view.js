sap.ui.jsview("hcm.tfl.fitnote.view.main", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf z_absence.main
	*/ 
	getControllerName : function() {
		return "hcm.tfl.fitnote.view.main";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf z_absence.main
	*/ 
	createContent : function(oController) {
		this.setDisplayBlock(true);
		this.app = new sap.m.App();	
		var detail = sap.ui.xmlview("Detail", "hcm.tfl.fitnote.view.Detail");
		this.app.addPage(detail,false);
		
		return this.app;
	}

});