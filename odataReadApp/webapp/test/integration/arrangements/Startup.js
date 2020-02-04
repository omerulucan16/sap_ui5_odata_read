sap.ui.define([
	"sap/ui/test/Opa5",
	"com/omerulucan/odataread/odataReadApp/localService/mockserver",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/routing/HashChanger",
	"com/omerulucan/odataread/odataReadApp/test/flpSandbox",
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(Opa5, mockserver, ODataModel, HashChanger, flpSandbox, FakeLrepConnectorLocalStorage) {
	"use strict";

	return Opa5.extend("com.omerulucan.odataread.odataReadApp.test.integration.arrangements.Startup", {

		/**
		 * Initializes mock server and flp sandbox, then sets the hash intent to simulate pressing on the app tile
		 * @param {object} oOptionsParameter An object that contains the configuration for starting up the app
		 * @param {integer} oOptionsParameter.delay A custom delay to start the app with
		 * @param {string} oOptionsParameter.intent The intent to start the FLP sandbox with initially, may also contain an in-app hash as a shortcut
		 * @param {string} [oOptionsParameter.hash] The in-app hash can also be passed separately for better readability in tests
		 * @param {boolean} [oOptionsParameter.autoWait=true] Automatically wait for pending requests while the application is starting up
		 */
		iStartMyFLPApp: function (oOptionsParameter) {
			var oOptions = oOptionsParameter || {};

			this._clearSharedData();

			// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
			oOptions.delay = oOptions.delay || 1;

			var aInitializations = [];

			// configure mock server with the current options
			aInitializations.push(mockserver.init(oOptions));
			aInitializations.push(flpSandbox.init());

			// Wait for all initialization promises of mock server and sandbox to be fulfilled.
			// After that enable the fake LRepConnector
			this.iWaitForPromise(Promise.all(aInitializations));
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			this.waitFor({
				autoWait: (oOptions ? oOptions.autoWait : true),
				success: function () {
					new HashChanger().setHash(oOptions.intent + (oOptions.hash ? "&/" + oOptions.hash : ""));
				}
			});
		},
		iRestartTheAppWithTheRememberedItem : function (oOptions) {
			var sObjectId;
			this.waitFor({
				success : function () {
					sObjectId = this.getContext().currentItem.id;
				}
			});

			this.waitFor({
				success : function() {
					oOptions.hash = "DogumGunleriBilgileriSet/" + encodeURIComponent(sObjectId);
					this.iStartMyFLPApp(oOptions);
				}
			});
		},
		_clearSharedData: function () {
			// clear shared metadata in ODataModel to allow tests for loading the metadata
			ODataModel.mSharedData = { server: {}, service: {}, meta: {} };
		}
	});
});