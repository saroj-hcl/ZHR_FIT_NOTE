jQuery.sap.declare("hcm.tfl.fitnote.Component");
sap.ui.core.UIComponent.extend("hcm.tfl.fitnote.Component", {
metadata :
    {
      "library" : "hcm.tfl.fitnote",
      "includes" : ["css/StyleFile.css"],
        "dependencies" : {
        "libs" : ["sap.m","sap.ui.commons"],
      "components" : []
      },
    },

  createContent : function() 
  {
    var oView = sap.ui.view({
      id : "app",
      viewName : "hcm.tfl.fitnote.view.main",
      type : "JS",
      viewData : { component : this }
    });
    return oView;
  }
});