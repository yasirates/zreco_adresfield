sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library"
], function (Controller, UIComponent, mobileLibrary) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("zrecoadresfield.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        _createGetRequet: function (sUrl, successEvent, failEvent) {
            sap.ui.core.BusyIndicator.show();
            var settings = {
                "url": "/sap/bc/http/sap/" + sUrl,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "dataType": "json"
            };
            $.ajax(settings)
                // .done(successEvent)
                .done(function (oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    successEvent(oResponse);
                })
                // .fail(failEvent)
                .fail(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error("Hata Oluştu: " + oError.responseText);
                    failEvent(oError);
                })
                .always(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        _createPostRequet: function (sUrl, sData, successEvent, failEvent) {
            sap.ui.core.BusyIndicator.show();
            var settings = {
                "url": "/sap/bc/http/sap/" + sUrl,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(sData),
            };
            $.ajax(settings)
                // .done(successEvent)
                .done(function (oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    successEvent(oResponse);
                })
                // .fail(failEvent)
                .fail(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error("Hata Oluştu: " + oError.responseText);
                    failEvent(oError);
                })
                .always(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
        }

    });
});