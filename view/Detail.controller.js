jQuery.sap.require("hcm.tfl.fitnote.util.Formatter");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("hcm.tfl.fitnote.view.Detail", {

  /**
   * Called when a controller is instantiated and its View controls (if available) are already created.
   * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
   * @memberOf z_absence.Detail
   */
  onInit: function() {

    // var begDa="20151001";
    var endDa= hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
    var requestId="";
    var time=localStorage.getItem("FitTime");
    var begDa;
    //var testDate=hcm.tfl.fitnote.util.Formatter.DATE_VIEW_ddMMYYYY(begDa);
    this.getView().byId("TXT_HDR_TITLE").setTitle(localStorage.getItem("EMPLOYEENAME"));
    this.getView().byId("TXT_START_DATE").setText(hcm.tfl.fitnote.util.Formatter.DATE_ddMMYYYY(localStorage.getItem("BegDa")));
    this.getView().byId("TXT_END_DATE").setText(hcm.tfl.fitnote.util.Formatter.DATE_ddMMYYYY(localStorage.getItem("EndDa")));

    if(localStorage.getItem("DelFitItem")!=null){
      requestId="";

    }else{
      requestId=localStorage.getItem("FitReqID");

    }

    var pernr=localStorage.getItem("PERNR");

    if(requestId=="")
    {
      begDa =hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
    }else {
      if(localStorage.getItem("OldDate")!=null)
      {
        begDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("OldDate"));
      }else
      {
        begDa =hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
      }

    }

    if(localStorage.getItem("DelFitItem")!=null){
    begDa="";
    }
if(sessionStorage.getItem("savedFitNote") != null)
{
    sessionStorage.removeItem("savedFitNote");
}

    var oDataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZHCM_LEAVE_REQ_CREATE_CHANGE_SRV");
    this.getView().data('oDataModel', oDataModel);
    var thisContext = this;
    oDataModel.read('ZFITNoteSet', null, {
      "$format": "json",
      "$filter":"Pernr eq '" + pernr+ "'" +" and "+"Begda eq '" + begDa +"'"+" and "+"RequestId eq '" + requestId +"'"+" and "+"Zitime eq '" + time +"'"
    }, false, function(oData, oResponse) {

      //added for defect 41
      var obj = JSON.parse(oResponse.body)
      if(obj.d.results.length>0)
      {
        sessionStorage.setItem("fitnotelngthBackend",obj.d.results[0].Counter);
        if(obj.d.results.length<parseInt(obj.d.results[0].Counter))
        {
          sessionStorage.setItem("hidden",(parseInt(obj.d.results[0].Counter)-obj.d.results.length));

        }
      }
      thisContext._dataLoadSuccess(oData, oResponse,begDa,endDa);
    }, function(oError) {
      //thisContext._dataLoadFail(oError);
    });
    //var oModel = new sap.ui.model.json.JSONModel("model/mock1.json");
    // this.getView().setModel(oModel,"mymodel");

  },

  _dataLoadSuccess: function(data,oResponse,begDa,endDa) {
    var oData = {};
    var strtDate = null;
    var temp=null;
    if(localStorage.getItem("FitRelatedLeaveKey")!=null){
      var FitJSONObj=JSON.parse(localStorage.getItem("FitRelatedLeaveKey"));
      //if((FitJSONObj.BegDa==begDa)){
      oData = new Object();

      oData.results=[];
      var rowLen=FitJSONObj.RowLength;
      var startdate=[];
      var enddate=[];
      startdate=FitJSONObj.Startdate;
      enddate=FitJSONObj.Enddate;
      for(var i=0;i<rowLen;i++){
        var items=new Object();
        items["Odtnn"]=startdate[i];
        items["Vdtnn"]=enddate[i];


        oData.results.push(items);

      }


      // }

      /*else{
         var obj = JSON.parse(oResponse.body);
           oData.results = obj.d.results;
              $.each(oData.results, function(i, item) {
                  item.index = i + 1;
                  item.expand = false;
                  item.dirtyState = false;
                  item.readOnly = false;
              });

       }*/



    }else{

      var obj = JSON.parse(oResponse.body);
      oData.results = obj.d.results;
      $.each(oData.results, function(i, item) {
        item.index = i + 1;
        item.expand = false;
        item.dirtyState = false;
        item.readOnly = false;
      });

    }


    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData(oData);
     sessionStorage.setItem("initialFitNoteData",JSON.stringify(oModel.oData));

    localStorage.setItem("fitdatalength",oModel.oData.results.length);
    for(var i=0;i<oModel.oData.results.length;i++){
      // fix for defect # 43
      if(oData.results[i].Vdtnn=="99991231")
      {
        oData.results[i].Vdtnn=""
      }

      var oForm = new sap.ui.layout.form.Form({
        layout: new sap.ui.layout.form.ResponsiveGridLayout({}),
        formContainers: [
                         new sap.ui.layout.form.FormContainer({
                           formElements: [
                                          new sap.ui.layout.form.FormElement({
                                            fields: [
                                                     new sap.m.Text({text:"Fit Note "+(parseInt(i)+1),textAlign:"Begin",layoutData:new sap.ui.layout.GridData({span: "L2 M2 S3"})}).addStyleClass("textStyle"),
                                                     new sap.m.Text({text:"Start Date",layoutData:new sap.ui.layout.GridData({span: "L1 M1"})}).addStyleClass("dateTextStyle"),
                                                     strtDate=new sap.m.DateTimeInput({
                                                       displayFormat:"dd.MM.yyyy",
                                                       valueFormat:"yyyy-MM-dd" ,
                                                       placeholder : "",
                                                       type : "Date",
                                                       layoutData:new sap.ui.layout.GridData({span: "L3 M1"}),
                                                       change : function(oControlEvent)
                                                       {
                                                         strtDate= oControlEvent.getParameters().value;
                                                         //console.log("startDate is"+strtDate);

                                                       }

                                                     }).setValue(oData.results[i].Odtnn),
                                                     new sap.m.Text({text:"End Date",layoutData:new sap.ui.layout.GridData({span: "L1 M1"})}).addStyleClass("dateTextStyle"),
                                                     new sap.m.DateTimeInput({
                                                       displayFormat:"dd.MM.yyyy",
                                                       valueFormat:"yyyy-MM-dd" ,
                                                       placeholder : "",
                                                       type : "Date",
                                                       layoutData:new sap.ui.layout.GridData({span: "L3 M1"}),
                                                       change : function(oControlEvent)
                                                       {

                                                         temp = this;
                                                         console.log(temp);
                                                         jQuery.sap.require("sap.m.MessageBox");
                                                         var endDate= oControlEvent.getParameters().value;
                                                         console.log("End date is"+endDate);
                                                         var D1=  new Date(strtDate);
                                                         var D2=  new Date(endDate);

                                                         if(D1.getTime() > D2.getTime())
                                                         {
                                                           jQuery("#"+temp.sid+"-inner").val("");
                                                           var dialog = new sap.m.Dialog({
                                                             title: 'Error',
                                                             type: 'Message',
                                                             state: 'Error',
                                                             content: new sap.m.Text({
                                                               text: 'End date can not be less than Start Date'
                                                             }),
                                                             beginButton: new sap.m.Button({
                                                               text: 'OK',
                                                               press: function () {
                                                                 jQuery("#"+temp.sId+"-inner").val("");
                                                                 //temp.setDateValue(new Date());

                                                                 dialog.close();
                                                               }
                                                             }),
                                                             afterClose: function() {
                                                               dialog.destroy();
                                                             }
                                                           });

                                                           dialog.open();

                                                           //new  sap.m.MessageBox.show("End Date can not be less than start date");

                                                         }

                                                       }
                                                     }).setValue(oData.results[i].Vdtnn),
                                                     new sap.ui.core.Icon(
                                                         {
                                                           busy : false, // boolean
                                                           busyIndicatorDelay : 1000, // int
                                                           visible : true, // boolean
                                                           src : sap.ui.core.IconPool.getIconURI("sys-cancel"), // sap.ui.core.URI
                                                           size : undefined, // sap.ui.core.CSSSize
                                                           color : "#cc1919", // string
                                                           layoutData:new sap.ui.layout.GridData({span: "L2 M4 S8" }),
                                                           press : [
                                                                    function(oEvent) {
                                                                      //parseInt(i);
                                                                      var control = oEvent.getSource();
                                                                      /*if(this.getView().byId("icnTBFilter").getContent().length==1){
                                    this.getView().byId("icnTBFilter").removeAllContent();
                                  }else{
                                    this.getView().byId("icnTBFilter").removeContent(oForm);
                                  }*/
                                                                      fitandAbsCount=fitandAbsCount+1;// Added for defect 41
                                                                      oEvent.getSource().getParent().getParent().getParent().destroy();

                                                                    }, this ]
                                                         })
                                                     ]
                                          }),
                                          ]
                         })
                         ]
      }).addStyleClass("formStyle");

      //this.getView().byId("idVbox").addItem(oForm);
      this.getView().byId("icnTBFilter").addContent(oForm);

    }
    window.count=parseInt(i)+1;
  },

  /**
   * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
   * (NOT before the first rendering! onInit() is used for that one!).
   * @memberOf z_absence.Detail
   */
//  onBeforeRendering: function() {

//  },

  /**
   * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
   * This hook is the same one that SAPUI5 controls get after being rendered.
   * @memberOf z_absence.Detail
   */
  onAfterRendering: function() {
    //console.log("onafterRendering");
    var absenceTypeCode=localStorage.getItem("AbsenceType");
    var time=localStorage.getItem("FitTime");
    var pernr=localStorage.getItem("PERNR");
    //var begDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
    // var begDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("OldDate"));
    var requestId=localStorage.getItem("FitReqID");

    var begDa;
    if(requestId=="")
    {
      begDa =hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
    }else {
      if(localStorage.getItem("OldDate")!=null)
      {
        begDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("OldDate"));
      }else
      {
        begDa =hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
      }

    }
    var oDataModelAdd = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZHCM_LEAVE_REQ_CREATE_CHANGE_SRV");
    this.getView().data('oDataModelAdd', oDataModelAdd);
    var thisContext = this;
    oDataModelAdd.read('ZAdditionalAbsentDataSet', null, {
      "$format": "json",
      "$filter":"Pernr eq '" + pernr+ "'" +" and "+"Begda eq '" + begDa +"'"+ " and "+"Awart eq '" + absenceTypeCode +"'"+ " and "+"RequestId eq '" + requestId +"'"+ " and "+"Zitime eq '" + time +"'"



    }, false, function(oData, oResponse) {
      var oData={};
      if(oResponse){
        var obj = JSON.parse(oResponse.body);
        if(obj.d.results.length >0)
        {

          if(obj.d.results.length == 1 && obj.d.results[0].Occcd== "")
          {
            sessionStorage.setItem("hiddenAdd",(parseInt(obj.d.results[0].CounterR)));
          } else
          {
            sessionStorage.setItem("addabslngthBackend",obj.d.results[0].CounterR);
            if(obj.d.results.length<parseInt(obj.d.results[0].CounterR))
            {
              sessionStorage.setItem("hiddenAdd",(parseInt(obj.d.results[0].CounterR)-obj.d.results.length));

            }
          }
        }
      }
      //thisContext._dataLoadSuccess(oData, oResponse,buttonStatus);
    }, function(oError) {
      //thisContext._dataLoadFail(oError);
    });


    // Variable declared for defect 41
    var additionalAbsLength=0;
    var hiddenFn=0;
    var fitnoteLength=0;
    fitandAbsCount=25;
    var AdditionalFromJSON=null;
    var hiddenAddAbs=0;
    var addAbsSavedData=parseInt(sessionStorage.getItem("addAbsSavedData"));
    // end
    if(sessionStorage.getItem("fitnotelngthBackend")!=null)
    {
      fitnoteLength=parseInt(sessionStorage.getItem("fitnotelngthBackend"));
      sessionStorage.removeItem("fitnotelngthBackend");
    }
    if(sessionStorage.getItem("addabslngthBackend")!=null)
    {
      additionalAbsLength=parseInt(sessionStorage.getItem("addabslngthBackend"));
      sessionStorage.setItem("ResetAddAbsLength",additionalAbsLength);
      sessionStorage.removeItem("addabslngthBackend");
    }
    if(sessionStorage.getItem("hiddenAdd")!=null)
    {
      hiddenAddAbs=parseInt(sessionStorage.getItem("hiddenAdd"));
      sessionStorage.setItem("ResetHidAddAbs",hiddenAddAbs);
      sessionStorage.removeItem("hiddenAdd");
    }
    if(sessionStorage.getItem("hidden")!=null)
    {
      hiddenFn=parseInt(sessionStorage.getItem("hidden"));
      sessionStorage.removeItem("hidden");
    }

    if(localStorage.getItem("AdditionalDataInfo")!=null){
      AdditionalFromJSON=JSON.parse(localStorage.getItem("AdditionalDataInfo"));
    }
    if(localStorage.getItem("FitRelatedLeaveKey")!=null && AdditionalFromJSON==null ){
      var fitnoteData=JSON.parse(localStorage.getItem("FitRelatedLeaveKey"));


      if(addAbsSavedData ==0)
      {
       fitandAbsCount=fitandAbsCount-((parseInt(fitnoteData.RowLength)+hiddenFn)+hiddenAddAbs+1);
       }else
        fitandAbsCount=fitandAbsCount-((parseInt(fitnoteData.RowLength)+hiddenFn)+additionalAbsLength);
    }
    if(AdditionalFromJSON!=null && localStorage.getItem("FitRelatedLeaveKey")==null){
      fitandAbsCount=fitandAbsCount-((parseInt(AdditionalFromJSON.RowLength)+hiddenAddAbs)+fitnoteLength);
    }
    if(localStorage.getItem("FitRelatedLeaveKey")!=null && AdditionalFromJSON!=null)
    {
      var fitnoteData=JSON.parse(localStorage.getItem("FitRelatedLeaveKey"));
      fitandAbsCount=fitandAbsCount-((parseInt(fitnoteData.RowLength)+parseInt(hiddenFn))+ (parseInt(AdditionalFromJSON.RowLength)+parseInt(hiddenAddAbs)));
    }
    if(localStorage.getItem("FitRelatedLeaveKey")==null && AdditionalFromJSON==null)
    { //fitandAbsCount=fitandAbsCount-hiddenAddAbs-parseInt(hiddenFn);
      if(fitnoteLength==0 && additionalAbsLength==0)
      {
        if(hiddenAddAbs==0)
        {
          fitandAbsCount=fitandAbsCount-1;
        }else {fitandAbsCount=fitandAbsCount-hiddenAddAbs-1;}
      } else
        if(fitnoteLength ==0 && additionalAbsLength != 0)
        { if(addAbsSavedData ==0)
            {
            fitandAbsCount=fitandAbsCount-(fitnoteLength+hiddenAddAbs);
            }else
          fitandAbsCount=fitandAbsCount-(fitnoteLength+additionalAbsLength);
        } else
          if(fitnoteLength !=0 && additionalAbsLength == 0)
          {
              if(hiddenAddAbs==0)
                {
                  fitandAbsCount=fitandAbsCount-(fitnoteLength+additionalAbsLength+1);
                }else {fitandAbsCount=fitandAbsCount-(fitnoteLength+hiddenAddAbs+1);}

          } else
          {
            if(addAbsSavedData ==0)
            {
            fitandAbsCount=fitandAbsCount-(fitnoteLength+hiddenAddAbs+1);
            }else
            fitandAbsCount=fitandAbsCount-(fitnoteLength+additionalAbsLength);
          }
    }
sessionStorage.setItem("fitandaddcount",fitandAbsCount);


//    $.ajaxSetup({
//    async: false
//    });
//    var oModel1 = new sap.ui.model.json.JSONModel();

//    //Fetch the data from local json file and set into the model
//    $.getJSON("model\\data.json", function(data) {
//    oModel1.setData(data);
//    });

//    var modelLength=oModel1.getProperty("/d/results").length;
//    this.getView().byId("fitNoteTable").setVisibleRowCount(modelLength);
  },

  /**
   * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
   * @memberOf z_absence.Detail
   */
//  onExit: function() {

//  }

  /*
   * onAddRowPress function will be executed when Add Row button will press
   */
  onAddRowPress: function (oEvent) {
    var strtDate = null;
    var temp=null;
    var checkFlag=false;
    var alertMessage="";
    var oTableLength=this.getView().byId("icnTBFilter").getContent().length;
    for(var i=0;i<oTableLength;i++){

      if((this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()!="") &&
          (this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()!="")){
        var D1=  new Date(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue());
        var D2=  new Date(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue());
        if(D1.getTime() > D2.getTime()){
          checkFlag=true;
          alertMessage="End date can not be less than Start Date";
          break;
        }
      }
      if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()==""){
        checkFlag=true;
        alertMessage="StartDate/EndDate cannot be blank";
        break;
      }

      if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()=="") {
        checkFlag=true;
        alertMessage="StartDate/EndDate cannot be blank";
        break;

      }

    }

    if(checkFlag){

      var dialog = new sap.m.Dialog({
        title: 'Warning',
        type: 'Message',
        state: 'Warning',
        content: new sap.m.Text({
          text: alertMessage
        }),
        beginButton: new sap.m.Button({
          text: 'OK',
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();

    }else{
      var actualTabLength;//will come from OData
      var rowLenABS=0;
      if(localStorage.getItem("AdditionalDataInfo")!=null){
        var adAbsenceData=JSON.parse(localStorage.getItem("AdditionalDataInfo"));
        rowLenABS=adAbsenceData.RowLength;
        actualTabLength=25
      }else{actualTabLength=24}
      if(sessionStorage.getItem("hiddenAdd")!=null)
      {
        rowLenABS=rowLenABS+parseInt(sessionStorage.getItem("hiddenAdd"));
      }
      var Flength=0;
      var Alength=0;
      var totallength=0;
      if(sessionStorage.getItem("fitnotelngthBackend")!=null)
      {
        Flength=parseInt(sessionStorage.getItem("fitnotelngthBackend"));
      }
      if(sessionStorage.getItem("fitnotelngthBackend")==null)
      {
        actualTabLength=actualTabLength-1;
      }
      if(sessionStorage.getItem("addabslngthBackend")!= null)
      {
        Alength=parseInt(sessionStorage.getItem("addabslngthBackend"));
      }
      /* if(sessionStorage.getItem("addabslngthBackend")==null)
          {
          actualTabLength=actualTabLength-1;
          }*/

      if(rowLenABS >Alength )
      {
        Alength=rowLenABS;
      }
      totallength=Flength+Alength;

      // var addRowLength=parseInt(actualTabLength)-parseInt(rowLenABS);
      var addRowLength=parseInt(actualTabLength)-parseInt(totallength);
      var contentLength=this.getView().byId("icnTBFilter").getContent().length;
      addRowLength=addRowLength+Flength;


      //  if(parseInt(contentLength)>parseInt(addRowLength)){
      if(fitandAbsCount<1){
        var dialog = new sap.m.Dialog({
          title: 'Warning',
          type: 'Message',
          state: 'Warning',
          content: new sap.m.Text({
            text: 'System will not allow to add Fit Note'
          }),
          beginButton: new sap.m.Button({
            text: 'OK',
            press: function () {
              fitandAbsCount=fitandAbsCount+1;
              dialog.close();
            }
          }),
          afterClose: function() {
            dialog.destroy();
          }
        });

        dialog.open();

      }else{

        var oForm = new sap.ui.layout.form.Form({
          layout: new sap.ui.layout.form.ResponsiveGridLayout({}),
          formContainers: [
                           new sap.ui.layout.form.FormContainer({
                             formElements: [
                                            new sap.ui.layout.form.FormElement({
                                              fields: [
                                                       new sap.m.Text({text:"Fit Note "+window.count++,textAlign:"Begin",layoutData:new sap.ui.layout.GridData({span: "L2 M2 S3"})}).addStyleClass("textStyle"),
                                                       new sap.m.Text({text:"Start Date",layoutData:new sap.ui.layout.GridData({span: "L1 M1"})}).addStyleClass("dateTextStyle"),
                                                       new sap.m.DateTimeInput({
                                                         displayFormat:"dd.MM.yyyy",
                                                         valueFormat:"yyyy-MM-dd" ,
                                                         placeholder : "",
                                                         type : "Date",
                                                         layoutData:new sap.ui.layout.GridData({span: "L3 M1"}),
                                                         change : function(oControlEvent)
                                                         {
                                                           strtDate= oControlEvent.getParameters().value;
                                                           //console.log("startDate is"+strtDate);

                                                         }

                                                       }),
                                                       new sap.m.Text({text:"End Date",layoutData:new sap.ui.layout.GridData({span: "L1 M1"})}).addStyleClass("dateTextStyle"),
                                                       new sap.m.DateTimeInput({
                                                         displayFormat:"dd.MM.yyyy",
                                                         valueFormat:"yyyy-MM-dd" ,
                                                         placeholder : "",
                                                         type : "Date",
                                                         layoutData:new sap.ui.layout.GridData({span: "L3 M1"}),
                                                         change : function(oControlEvent)
                                                         {

                                                           temp = this;
                                                           console.log(temp);
                                                           jQuery.sap.require("sap.m.MessageBox");
                                                           var endDate= oControlEvent.getParameters().value;
                                                           //console.log("End date is"+endDate);
                                                           var D1=  new Date(strtDate);
                                                           var D2=  new Date(endDate);

                                                           if(D1.getTime() > D2.getTime())
                                                           {
                                                             jQuery("#"+temp.sid+"-inner").val("");
                                                             var dialog = new sap.m.Dialog({
                                                               title: 'Error',
                                                               type: 'Message',
                                                               state: 'Error',
                                                               content: new sap.m.Text({
                                                                 text: 'End date can not be less than Start Date'
                                                               }),
                                                               beginButton: new sap.m.Button({
                                                                 text: 'OK',
                                                                 press: function () {
                                                                   jQuery("#"+temp.sId+"-inner").val("");
                                                                   //temp.setDateValue(new Date());

                                                                   dialog.close();
                                                                 }
                                                               }),
                                                               afterClose: function() {
                                                                 dialog.destroy();
                                                               }
                                                             });

                                                             dialog.open();

                                                             //new  sap.m.MessageBox.show("End Date can not be less than start date");

                                                           }

                                                         }
                                                       }),
                                                       new sap.ui.core.Icon(
                                                           {
                                                             busy : false, // boolean
                                                             busyIndicatorDelay : 1000, // int
                                                             visible : true, // boolean
                                                             src : sap.ui.core.IconPool.getIconURI("sys-cancel"), // sap.ui.core.URI
                                                             size : undefined, // sap.ui.core.CSSSize
                                                             color : "#cc1919", // string
                                                             layoutData:new sap.ui.layout.GridData({span: "L2 M4 S8" }),
                                                             press : [
                                                                      function(oEvent) {

                                                                        /*if(this.getView().byId("icnTBFilter").getContent().length==1){
                                        this.getView().byId("icnTBFilter").removeAllContent();
                                      }else{
                                        this.getView().byId("icnTBFilter").removeContent(oForm);
                                      }*/
                                                                        fitandAbsCount=fitandAbsCount+1;// Added for defect 41
                                                                        oEvent.getSource().getParent().getParent().getParent().destroy();
                                                                      }, this ]
                                                           })
                                                       ]
                                            }),
                                            ]
                           })
                           ]
        }).addStyleClass("formStyle");

        //this.getView().byId("idVbox").addItem(oForm);
        this.getView().byId("icnTBFilter").addContent(oForm);


      }


    }

    fitandAbsCount=fitandAbsCount-1;

  },

  saveNote:function(oEvent){
    /**  var requestId=localStorage.getItem("ReqID");
         var pernr=localStorage.getItem("PERNR");
         var status =localStorage.getItem("Status");**/
    //var begDa=hcm.tfl.fitnote.util.Formatter.DATE_ddMMyyyy(localStorage.getItem("BegDa"));
    //var endDa=hcm.tfl.fitnote.util.Formatter.DATE_ddMMyyyy(localStorage.getItem("EndDa"));
    var begDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
    var endDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
    // var illnessCode= localStorage.getItem("Illness");
    // var oper=null;
    // var infty="82";
    // var subty="9000";
    var oTableLength=this.getView().byId("icnTBFilter").getContent().length;
    //var scenario=localStorage.getItem("buttonStatus");
    var startdate=[];
    var enddate=[];
    var event=[];
    var note=[];
    var check=[];
//    isFitNoteSaved = true;  // Added 13-04-2016
    //
    sessionStorage.setItem("savedFitNote",this.getView().byId("icnTBFilter").getContent().length);
    // var paramCount=24;
    //var rowLenABS=0;


    /**  var maxRowLength=parseInt(paramCount)+1;
        var startIndex=parseInt(paramCount)+1;**/




    //

    if(oTableLength==0){
      if((localStorage.getItem("FitRelatedLeaveKey")!=null)){
        localStorage.removeItem("FitRelatedLeaveKey");
      }
      var startdate=[];
      var enddate=[];
      var event=[];
      var note=[];
      var check=[];
      //var len=localStorage.getItem("fitdatalength");
      for(var i=0;i<25;i++){
        event.push("");
        startdate.push("99990101");
        enddate.push("99991231");
        note.push("");
        check.push("N");
      }
      var oDelFitEntry = {};
      oDelFitEntry.Startdate=startdate;
      oDelFitEntry.Enddate=enddate;
      oDelFitEntry.EventCode=event;
      oDelFitEntry.Note=note;
      oDelFitEntry.Check=check;
      oDelFitEntry.BegDa=begDa;
      oDelFitEntry.EndDa=endDa;
      //oDelFitEntry.length= localStorage.getItem("fitdatalength");


      var oBackEntry = {};
      oBackEntry.BegDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
      oBackEntry.EndDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
      oBackEntry.Starttime=localStorage.getItem("starttime");
      oBackEntry.Endtime=localStorage.getItem("endtime");
      oBackEntry.Workhour=localStorage.getItem("workhour");
      oBackEntry.Approver=localStorage.getItem("approveremployee");
      oBackEntry.AbsenceCode=localStorage.getItem("AbsenceType");
      oBackEntry.note=localStorage.getItem("note");
      oBackEntry.illnessType=localStorage.getItem("illnessType");


      var leaveKey;
      if(localStorage.getItem("LeaveKey")!=""){
        var reqId=leaveKey;
        localStorage.setItem("buttonStatus", "change");
        localStorage.setItem("RequestID",  localStorage.getItem("FitReqID"));
        localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
        localStorage.setItem("DelFitItem",JSON.stringify(oDelFitEntry));

        //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");

        //window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by Santosh
        window.location.reload(history.go(-1))
      }else{
        leaveKey="1111";
        localStorage.setItem("buttonStatus", "create");
        localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
        //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
        //window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by santosh
        window.location.reload(history.go(-1))
        //document.location.href=encodeURI("/irj/portal/fiori#ZHCMLeave-membersleave&/history");
      }

    }else{

      var blankFlag=false;
      var alertMessage="";

      for(var i=0;i<25;i++){
        if(i<oTableLength){

          if((this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()!="") &&
              (this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()!="")){
            var D1=  new Date(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue());
            var D2=  new Date(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue());
            if(D1.getTime() > D2.getTime()){
              blankFlag=true;
              alertMessage="End date can not be less than Start Date";
              break;
            }
          }
          //startdate.push(hcm.tfl.fitnote.util.Formatter.DATE_ddMMyyyy(this.byId('fitNoteTable').getContextByIndex(0).oModel.oData.results[i].Begda));
          //enddate.push(hcm.tfl.fitnote.util.Formatter.DATE_ddMMyyyy(this.byId('fitNoteTable').getContextByIndex(0).oModel.oData.results[i].Endda));
          if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()!=""){
            startdate.push(hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()));
          } else{
            blankFlag=true;
            alertMessage="StartDate/EndDate cannot be blank";
            break;
            //startdate.push("");
          }
          if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()!="") {
            enddate.push(hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()));
          } else{
            blankFlag=true;
            alertMessage="StartDate/EndDate cannot be blank";
            break;
            //enddate.push("");
          }




          event.push("18");
          note.push("");
          check.push("N");

        }else{
          event.push("");
          startdate.push("99990101");
          enddate.push("99991231");
          note.push("");
          check.push("N");

        }

      }

      //var oRelatedRequestsByLeaveKey = {}; // object of arrays
      //oRelatedRequestsByLeaveKey[oResult[i].LeaveKey].push(oResult[i]);

      if(blankFlag){
        var dialog = new sap.m.Dialog({
          title: 'Warning',
          type: 'Message',
          state: 'Warning',
          content: new sap.m.Text({
            text: alertMessage
          }),
          beginButton: new sap.m.Button({
            text: 'OK',
            press: function () {
              dialog.close();
            }
          }),
          afterClose: function() {
            dialog.destroy();
          }
        });

        dialog.open();
      }else{

        var oRelatedByLeaveKey = {};

        var leaveKey;
        if(localStorage.getItem("LeaveKey")!=""){

          localStorage.removeItem("DelFitItem");
          leaveKey=localStorage.getItem("LeaveKey");
          oRelatedByLeaveKey.BegDa=begDa;
          oRelatedByLeaveKey.EndDa=endDa;
          oRelatedByLeaveKey.Startdate=startdate;
          oRelatedByLeaveKey.Enddate=enddate;
          oRelatedByLeaveKey.LeaveKey=leaveKey;
          oRelatedByLeaveKey.EventCode=event;
          oRelatedByLeaveKey.RowLength=oTableLength;
          oRelatedByLeaveKey.Note=note;
          oRelatedByLeaveKey.Check=check;
          var oBackEntry = {};
          oBackEntry.BegDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
          oBackEntry.EndDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
          oBackEntry.Starttime=localStorage.getItem("starttime");
          oBackEntry.Endtime=localStorage.getItem("endtime");
          oBackEntry.Workhour=localStorage.getItem("workhour");
          oBackEntry.Approver=localStorage.getItem("approveremployee");
          oBackEntry.AbsenceCode=localStorage.getItem("AbsenceType");
          oBackEntry.note=localStorage.getItem("note");
          oBackEntry.illnessType=localStorage.getItem("illnessType");


          //var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
          var reqId=leaveKey;
          localStorage.setItem("buttonStatus", "change");
          localStorage.setItem("RequestID",  localStorage.getItem("FitReqID"));
          localStorage.setItem("FitRelatedLeaveKey",JSON.stringify(oRelatedByLeaveKey));
          localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
          //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
          //window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by Santosh
          window.location.reload(history.go(-1))
          //  $("body").append($form);
          //$form.submit();

        }else{
          leaveKey="1111";
          oRelatedByLeaveKey.BegDa=begDa;
          oRelatedByLeaveKey.EndDa=endDa;
          oRelatedByLeaveKey.Startdate=startdate;
          oRelatedByLeaveKey.Enddate=enddate;
          oRelatedByLeaveKey.LeaveKey=leaveKey;
          oRelatedByLeaveKey.RowLength=oTableLength;
          oRelatedByLeaveKey.EventCode=event;
          oRelatedByLeaveKey.Note=note;
          oRelatedByLeaveKey.Check=check;
          //var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
          var oBackEntry = {};
          oBackEntry.BegDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
          oBackEntry.EndDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
          oBackEntry.Starttime=localStorage.getItem("starttime");
          oBackEntry.Endtime=localStorage.getItem("endtime");
          oBackEntry.Workhour=localStorage.getItem("workhour");
          oBackEntry.Approver=localStorage.getItem("approveremployee");
          oBackEntry.AbsenceCode=localStorage.getItem("AbsenceType");
          oBackEntry.note=localStorage.getItem("note");
          oBackEntry.illnessType=localStorage.getItem("illnessType");
          localStorage.setItem("buttonStatus", "create");
          localStorage.setItem("FitRelatedLeaveKey",JSON.stringify(oRelatedByLeaveKey));
          localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
          //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
          //window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by Santosh
          window.location.reload(history.go(-1))
          //$("body").append($form);
          //$form.submit();

        }

      }



    }



  },

  _handleResetButtonPress:function(){
    var begDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));


    // var begDa="20151001";
    var endDa= hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
    var requestId=localStorage.getItem("FitReqID");
    var time=localStorage.getItem("FitTime");
    //var testDate=hcm.tfl.fitnote.util.Formatter.DATE_VIEW_ddMMYYYY(begDa);

    this.getView().byId("TXT_START_DATE").setText(hcm.tfl.fitnote.util.Formatter.DATE_ddMMYYYY(localStorage.getItem("BegDa")));
    this.getView().byId("TXT_END_DATE").setText(hcm.tfl.fitnote.util.Formatter.DATE_ddMMYYYY(localStorage.getItem("EndDa")));
    var pernr=localStorage.getItem("PERNR");
    var oDataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZHCM_LEAVE_REQ_CREATE_CHANGE_SRV");
    this.getView().data('oDataModel', oDataModel);
    var thisContext = this;
    oDataModel.read('ZFITNoteSet', null, {
      "$format": "json",
      "$filter":"Pernr eq '" + pernr+ "'" +" and "+"Begda eq '" + begDa +"'"+" and "+"RequestId eq '" + requestId +"'"+" and "+"Zitime eq '" + time +"'"
    }, false, function(oData, oResponse) {
      if(thisContext._isResetPopUp(oData, oResponse)!=false)
           thisContext. _dataResetLoadSuccess(oData, oResponse,begDa,endDa);
   }, function(oError) {
      //thisContext._dataLoadFail(oError);
    });

  },


  _isResetPopUp : function(oData, oResponse){

    var addLengthFromscreen=0;
      var oData = {};
      var adAbsenceLength=0
      var addAbsenceHidden=0;
      var totalCount=0;
      var obj = JSON.parse(oResponse.body);
         oData.results = obj.d.results;
        $.each(oData.results, function(i, item) {
          item.index = i + 1;
          item.expand = false;
          item.dirtyState = false;
          item.readOnly = false;
        });
       var fitNoteLength=oData.results.length;
if(sessionStorage.getItem("ResetAddAbsLength")!= null)
{
    adAbsenceLength= parseInt(sessionStorage.getItem("ResetAddAbsLength"));

}
if(sessionStorage.getItem("ResetHidAddAbs")!= null)
{
    addAbsenceHidden=parseInt(sessionStorage.getItem("ResetHidAddAbs"));

}

var addAbsSavedData= sessionStorage.getItem("addAbsSavedData");

      if(localStorage.getItem("AdditionalDataInfo") != null)
      {
           var adAbsenceData=JSON.parse(localStorage.getItem("AdditionalDataInfo"));
           addLengthFromscreen=adAbsenceData.RowLength;
        totalCount=fitNoteLength+addLengthFromscreen+addAbsenceHidden;

      }
      if(localStorage.getItem("AdditionalDataInfo")==null)
      {
        if(addAbsSavedData==0)
          {
          totalCount=fitNoteLength+addAbsenceHidden;
          } else
              totalCount=fitNoteLength+adAbsenceLength;
      }
      fitandAbsCount=25-totalCount; // Added on 04/05/2016 for defect 41
      if(totalCount>25)
      {
        var dialog = new sap.m.Dialog({
          title: 'Error',
          type: 'Message',
          state: 'Error',
          content: new sap.m.Text({
            text: 'Reset not possible, not enough rows available.  Please exit and re-open the application to return to the initial state'
          }),
          beginButton: new sap.m.Button({
            text: 'OK',
            press: function () {

              dialog.close();
            }
          }),
          afterClose: function() {
            dialog.destroy();
          }
        });

        dialog.open();
        return false;
      } else return true;

  },

  _dataResetLoadSuccess:function(data,oResponse){

  var currentContentLength=this.getView().byId("icnTBFilter").getContent().length
    this.getView().byId("icnTBFilter").removeAllContent();
    var strtDate = null;
    var temp=null;
    var oData = {};

   // Added on 04/05/2016 for defect 41 : START
  {

   // Added on 04/05/2016 for defect 41 : END
    var obj = JSON.parse(oResponse.body);
    oData.results = obj.d.results;
    $.each(oData.results, function(i, item) {
      item.index = i + 1;
      item.expand = false;
      item.dirtyState = false;
      item.readOnly = false;
    });
    }

    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData(oData);

    for(var i=0;i<oModel.oData.results.length;i++){
      // fix for defect # 43
      if(oData.results[i].Vdtnn=="99991231")
      {
        oData.results[i].Vdtnn=""
      }

      var oForm = new sap.ui.layout.form.Form({
        layout: new sap.ui.layout.form.ResponsiveGridLayout({}),
        formContainers: [
                         new sap.ui.layout.form.FormContainer({
                           formElements: [
                                          new sap.ui.layout.form.FormElement({
                                            fields: [
                                                     new sap.m.Text({text:"Fit Note "+(parseInt(i)+1),textAlign:"Begin",layoutData:new sap.ui.layout.GridData({span: "L2 M2 S3"})}).addStyleClass("textStyle"),
                                                     new sap.m.Text({text:"Start Date",layoutData:new sap.ui.layout.GridData({span: "L1 M1"})}).addStyleClass("dateTextStyle"),
                                                     new sap.m.DateTimeInput({
                                                       displayFormat:"dd.MM.yyyy",
                                                       valueFormat:"yyyy-MM-dd" ,
                                                       placeholder : "",
                                                       type : "Date",
                                                       layoutData:new sap.ui.layout.GridData({span: "L3 M1"}),
                                                       change : function(oControlEvent)
                                                       {
                                                         strtDate= oControlEvent.getParameters().value;
                                                         //console.log("startDate is"+strtDate);

                                                       }


                                                     }).setValue(oData.results[i].Odtnn),
                                                     new sap.m.Text({text:"End Date",layoutData:new sap.ui.layout.GridData({span: "L1 M1"})}).addStyleClass("dateTextStyle"),
                                                     new sap.m.DateTimeInput({
                                                       displayFormat:"dd.MM.yyyy",
                                                       valueFormat:"yyyy-MM-dd" ,
                                                       placeholder : "",
                                                       type : "Date",
                                                       layoutData:new sap.ui.layout.GridData({span: "L3 M1"}),
                                                       change : function(oControlEvent)
                                                       {

                                                         temp = this;
                                                         console.log(temp);
                                                         jQuery.sap.require("sap.m.MessageBox");
                                                         var endDate= oControlEvent.getParameters().value;
                                                         console.log("End date is"+endDate);
                                                         var D1=  new Date(strtDate);
                                                         var D2=  new Date(endDate);

                                                         if(D1.getTime() > D2.getTime())
                                                         {
                                                           jQuery("#"+temp.sid+"-inner").val("");
                                                           var dialog = new sap.m.Dialog({
                                                             title: 'Error',
                                                             type: 'Message',
                                                             state: 'Error',
                                                             content: new sap.m.Text({
                                                               text: 'End date can not be less than Start Date'
                                                             }),
                                                             beginButton: new sap.m.Button({
                                                               text: 'OK',
                                                               press: function () {
                                                                 jQuery("#"+temp.sId+"-inner").val("");
                                                                 //temp.setDateValue(new Date());

                                                                 dialog.close();
                                                               }
                                                             }),
                                                             afterClose: function() {
                                                               dialog.destroy();
                                                             }
                                                           });

                                                           dialog.open();

                                                           //new  sap.m.MessageBox.show("End Date can not be less than start date");

                                                         }

                                                       }
                                                     }).setValue(oData.results[i].Vdtnn),
                                                     new sap.ui.core.Icon(
                                                         {
                                                           busy : false, // boolean
                                                           busyIndicatorDelay : 1000, // int
                                                           visible : true, // boolean
                                                           src : sap.ui.core.IconPool.getIconURI("sys-cancel"), // sap.ui.core.URI
                                                           size : undefined, // sap.ui.core.CSSSize
                                                           color : "#cc1919", // string
                                                           layoutData:new sap.ui.layout.GridData({span: "L2 M4 S8" }),
                                                           press : [
                                                                    function(oEvent) {
                                                                      //parseInt(i);
                                                                      /*if(this.getView().byId("icnTBFilter").getContent().length==1){
                                      this.getView().byId("icnTBFilter").removeAllContent();
                                    }else{
                                      this.getView().byId("icnTBFilter").removeContent(oForm);
                                    }*/
                                                                      fitandAbsCount=fitandAbsCount+1;// Added for defect 41
                                                                      oEvent.getSource().getParent().getParent().getParent().destroy();
                                                                    }, this ]
                                                         })
                                                     ]
                                          }),
                                          ]
                         })
                         ]
      }).addStyleClass("formStyle");

      //this.getView().byId("idVbox").addItem(oForm);
      this.getView().byId("icnTBFilter").addContent(oForm);

    }

//fitandAbsCount=parseInt(sessionStorage.getItem("fitandaddcount")); // Added on 04/05/2016 for defect 41
  },

  handleNavButtonPress:function(){

  // Added below code on 9/5/2016
  if(sessionStorage.getItem("ResetAddAbsLength")!= null)
  {
   sessionStorage.removeItem("ResetAddAbsLength");
   }
  if(sessionStorage.getItem("ResetHidAddAbs")!= null)
  {
  sessionStorage.removeItem("ResetHidAddAbs");
  }



    var oBackEntry = {};
    oBackEntry.BegDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("BegDa"));
    oBackEntry.EndDa=hcm.tfl.fitnote.util.Formatter.DATE_YYYYMMdd(localStorage.getItem("EndDa"));
    oBackEntry.Starttime=localStorage.getItem("starttime");
    oBackEntry.Endtime=localStorage.getItem("endtime");
    oBackEntry.Workhour=localStorage.getItem("workhour");
    oBackEntry.Approver=localStorage.getItem("approveremployee");
    oBackEntry.AbsenceCode=localStorage.getItem("AbsenceType");
    oBackEntry.note=localStorage.getItem("note");
    oBackEntry.illnessType=localStorage.getItem("illnessType");
//start
    var fitNotePreviousObject=JSON.parse(sessionStorage.getItem("initialFitNoteData"));
    var oTableLength=this.getView().byId("icnTBFilter").getContent().length;
    var dataFlag=false;




    if(fitNotePreviousObject.results.length==0){
    if(oTableLength>0){

    for(var i=0;i< oTableLength;i++){

         if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()!=""){
           dataFlag=true;
           break;

         }
         if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()!="") {
           dataFlag=true;
           break;

         }


     }
    }


    }else if(fitNotePreviousObject.results.length>0){
        if(oTableLength>0){
           if(oTableLength>=fitNotePreviousObject.results.length){
               for(i=0;i<oTableLength;i++){
                  if((this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()!="") ||
(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()!="")){
                      if(i<fitNotePreviousObject.results.length){
                          var previousStartDate=new Date(hcm.tfl.fitnote.util.Formatter.DATE_FORMAT_YYYYMMdd(fitNotePreviousObject.results[i].Odtnn));
                          var currentStartDate=new Date(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue());
                          var previousEndDate=new Date(hcm.tfl.fitnote.util.Formatter.DATE_FORMAT_YYYYMMdd(fitNotePreviousObject.results[i].Vdtnn));
                          var currentEndDate=new Date(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue());
                          //hcm.tfl.fitnote.util.Formatter.DATE_FORMAT_YYYYMMdd(fitNotePreviousObject.results[i].Vdtnn)
                          if((previousStartDate.setHours(0,0,0,0)>currentStartDate.setHours(0,0,0,0)) || (previousStartDate.setHours(0,0,0,0)<currentStartDate.setHours(0,0,0,0))){

                              dataFlag=true;
                              break;
                          }

                           if((previousEndDate.setHours(0,0,0,0)>currentEndDate.setHours(0,0,0,0)) || (previousEndDate.setHours(0,0,0,0)<currentEndDate.setHours(0,0,0,0))){

                              dataFlag=true;
                              break;
                          }


                      }else{
                        dataFlag=true;
                        break;

                      }
                  }

               }


           }else if(oTableLength<fitNotePreviousObject.results.length){

             dataFlag=true;


           }



        }else{
           dataFlag=true;

        }



    }





//end
   /** var oTableLength=this.getView().byId("icnTBFilter").getContent().length;
    var dataFlag=false;
    for(var i=0;i< oTableLength;i++){

      if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue()!=""){
        dataFlag=true;
        break;

      }
      if(this.getView().byId("icnTBFilter").getContent()[i].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue()!="") {
        dataFlag=true;
        break;

      }


    }**/

    if(dataFlag){

      var dialog = new sap.m.Dialog({
        title: 'Warning',
        type: 'Message',
        state: 'Warning',
        content: new sap.m.Text({
          text: 'Your changes will be lost. Do you want to continue?'
        }),
        buttons : [
                   new sap.m.Button({
                     text: 'OK',

                     press: function (evt) {
                      if(sessionStorage.getItem("initialFitNoteData") != null)
                     	{
                     	    sessionStorage.removeItem("initialFitNoteData");
                     	}

                       if(localStorage.getItem("LeaveKey")!=""){

                         leaveKey=localStorage.getItem("LeaveKey");
                         //var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
                         var reqId=leaveKey;
                         localStorage.setItem("buttonStatus", "change");
                         localStorage.setItem("RequestID",  localStorage.getItem("FitReqID"));
                         localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
                         //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
                         // window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by Santosh
                         window.location.reload(history.go(-1))
                         //$("body").append($form);
                         //$form.submit();

                       }else{
                         //var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
                         localStorage.setItem("buttonStatus", "create");
                         localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
                         //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
                         // window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by santosh
                         window.location.reload(history.go(-1))

                         //$("body").append($form);
                         //$form.submit();

                       }

                       dialog.close();
                     }
                   }),
                   new sap.m.Button({
                     text: 'CLOSE',

                     press: function (evt) {
                       dialog.close();
                     }
                   }),

                   ],

      });

      dialog.open();

    }else{

      if(sessionStorage.getItem("initialFitNoteData") != null)
      {
          sessionStorage.removeItem("initialFitNoteData");
      }

      if(localStorage.getItem("LeaveKey")!=""){

        leaveKey=localStorage.getItem("LeaveKey");
        //var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
        var reqId=leaveKey;
        localStorage.setItem("buttonStatus", "change");
        localStorage.setItem("RequestID",  localStorage.getItem("FitReqID"));
        localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
        //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
        //window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave"); commented by Santosh
        window.location.reload(history.go(-1))
        //$("body").append($form);
        //$form.submit();

      }else{
        //var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
        localStorage.setItem("buttonStatus", "create");
        localStorage.setItem("BackButtonItem",JSON.stringify(oBackEntry));
        //window.location.replace("/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
        //window.location.replace("/irj/portal/fiori#ZHCMLeave-membersleave");commented by Santosh
        window.location.reload(history.go(-1))
        //$("body").append($form);
        //$form.submit();

      }

    }


    //alert("handleNavButtonPress");








    /** var dialog = new Dialog({
             title: 'Warning',
             type: 'Message',
             state: 'Warning',
             content: new Text({
           text: 'Ruling the world is a time-consuming task. You will not have a lot of spare time.'
          }),
           beginButton: new Button({
            text: 'OK',
            press: function () {
               if(localStorage.getItem("LeaveKey")!=""){

                    leaveKey=localStorage.getItem("LeaveKey");
                    var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
                      var reqId=leaveKey;
                      localStorage.setItem("buttonStatus", "change");
                    localStorage.setItem("RequestID",  reqId);
                    $("body").append($form);
                    $form.submit();

                  }else{
                    var $form=$(document.createElement('form')).css({display:'none'}).attr("method","GET").attr("action","/sap/bc/ui5_ui5/sap/z_my_leave_req/index.html");
                      localStorage.setItem("buttonStatus", "create");
                    $("body").append($form);
                    $form.submit();

                  }


           dialog.close();
         }
          }),
           afterClose: function() {
         dialog.destroy();
           }
         });

         dialog.open();**/




  }


});