sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
], function (BaseController, JSONModel, formatter, Filter) {
    "use strict";

    return BaseController.extend("zrecoadresfield.controller.Worklist", {

        formatter: formatter,

        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "viewModel");
            this.oViewModel = this.getModel("viewModel");
            this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.onReset();
        },

        onReset: function () {
            this.oViewModel.setProperty("/", {
                f: {
                    ADRC: {},
                    ADRC_RADIO: {}
                }
            });
        },

        onHesapTurChange: function () {
            this.oViewModel.setProperty("/KUNNR_NAME", "");
            this.oViewModel.setProperty("/LIFNR_NAME", "");
        },

        onVHReqHesapNo: function () {
            debugger;
            var that = this;
            var sPath = "";
            var sTemplate = null;
            var hesapTur = this.oViewModel.getProperty("/IV_HESAP_TUR") || "";
            if (hesapTur === "M") {
                sPath = "/I_Customer_VH";
                sTemplate = new sap.m.StandardListItem({
                    title: "{Customer}",
                    description: "{OrganizationBPName1}"
                });
            } else if (hesapTur === "S") {
                sPath = "/I_Supplier_VH";
                sTemplate = new sap.m.StandardListItem({
                    title: "{Supplier}",
                    description: "{SupplierName}"
                });
            }
            this._hesapNoDialog = new sap.m.SelectDialog({
                title: "{i18n>select}",
                items: {
                    path: sPath,
                    template: sTemplate
                },
                confirm: this._onhesapNoDialogClose.bind(this),
                search: function (oEvent) {
                    debugger;
                    var value = oEvent.getParameter("value");
                    var oBinding = oEvent.getSource().getBinding("items");
                    if (hesapTur === "M") {
                        oBinding.filter(new Filter("Customer", sap.ui.model.FilterOperator.Contains, value));
                    } else if (hesapTur === "S") {
                        oBinding.filter(new Filter("Supplier", sap.ui.model.FilterOperator.Contains, value));
                    }
                }
            });
            this.getView().addDependent(this._hesapNoDialog);
            this._hesapNoDialog.open();
        },

        _onhesapNoDialogClose: function (oEvent) {
            debugger;
            var selectedItem = oEvent.getParameter("selectedItem");
            if (selectedItem) {
                var hesapTur = this.oViewModel.getProperty("/IV_HESAP_TUR") || "";
                if (hesapTur === "M") {
                    this.oViewModel.setProperty("/KUNNR_NAME", selectedItem.getTitle());
                    this.oViewModel.setProperty("/KUNNR_NAME_DESC", selectedItem.getDescription());
                }
                else if (hesapTur === "S") {
                    this.oViewModel.setProperty("/LIFNR_NAME", selectedItem.getTitle());
                    this.oViewModel.setProperty("/LIFNR_NAME_DESC", selectedItem.getDescription());
                }
                this.onHesapNoChange();
            }
            this._hesapNoDialog = null;
        },

        onHesapNoChange: function () {
            var process = "G";
            var hesapTur = this.oViewModel.getProperty("/IV_HESAP_TUR") || "";
            var id = hesapTur === "M" ? this.oViewModel.getProperty("/KUNNR_NAME") : this.oViewModel.getProperty("/LIFNR_NAME");
            var reqUrl = "ZRECO_ADRES_FIELD_SRV?IV_ID=" + id + "&IV_HESAP_TUR=" + hesapTur + "&IV_PROCESS=" + process;
            var that = this;
            this._createGetRequet(reqUrl,
                function (oResponse) {
                    debugger;
                    if (oResponse && oResponse.ADRC_RADIO)
                        for (const pName in oResponse.ADRC_RADIO) {
                            if (oResponse.ADRC_RADIO.hasOwnProperty(pName)) {
                                if (pName.endsWith("_USE")) {
                                    oResponse.ADRC_RADIO[pName] = "X";
                                }
                                if (pName.endsWith("_X")){
                                  oResponse.ADRC_RADIO[pName] = 1; // -1 den 0 a çekildi 
                                }
                            }
                        }
                    that.oViewModel.setProperty("/f", oResponse);
                }
            );
        },

        onSave: function () {
            var hesapTur = this.oViewModel.getProperty("/IV_HESAP_TUR");
            var kunnr = this.oViewModel.getProperty("/f/KUNNR_NAME");
            var lifnr = this.oViewModel.getProperty("/f/LIFNR_NAME");
            if (!hesapTur || (hesapTur === 'M' && !kunnr) || (hesapTur === 'S' && !lifnr)) {
                sap.m.MessageToast.show(this.getResourceBundle().getText("msgRequiredField"));
                return;
            }

            var that = this;
            sap.m.MessageBox.confirm(this.getResourceBundle().getText("msgContinue"), {
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
                onClose: function (sAction) {
                    if (sAction === "OK") {
                       
                        that.save(hesapTur);
                    }
                }
            });
        },

        save: function (hesapTur) {
            var process = "S";
            var reqUrl = "ZRECO_ADRES_FIELD_SRV?&IV_PROCESS=" + process;
            var sData = this.oViewModel.getProperty("/f");
            var that = this;

            sData.ADRC_RADIO.hesap_tur = hesapTur;
            
           // this._createPostRequet("ZRECO_ADRES_FIELD_SAVE", sData,
           this._createPostRequet( reqUrl, sData.ADRC_RADIO,
                function (oResponse) {
                    debugger;
                    sap.m.MessageToast.show(oResponse);
                }
            );
        },

        onClear : function(){
            this.onReset();
        },

    });
});