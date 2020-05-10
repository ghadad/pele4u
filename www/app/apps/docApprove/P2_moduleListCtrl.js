/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_2
  //=================================================================
  .controller('P2_moduleListCtrl', function($scope,
    $http,
    $stateParams,
    $state,
    PelApi,
    $cordovaNetwork,
    $ionicLoading,
    $ionicModal,
    $timeout,
    $sessionStorage,
    appSettings,
    srvShareData
  ) {
    //----------------------- LOGIN --------------------------//
    $scope.appId = $stateParams.AppId;

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('app/apps/docApprove/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    //-----------------------------------------------
    //--    Is show BTN
    //-----------------------------------------------
    $scope.isShowBtn = function(qty) {
      var retVal = true;
      if (qty === "-1") {
        return "ng-hide";
      } else {
        return "ng-show";
      }

      return retVal;

    }
    $scope.pushBtnClass = function(event) {



      if (event === true) {
        return "pele-item-on-release";
      } else {
        return "pele-item-on-touch";
      }
    } // pushBtnClass
    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    //---------------------------------
    //--       goHome
    //---------------------------------
    $scope.goHome = function() {
      PelApi.goHome();
    }

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {

      var appId = $scope.appId;
      var pin = $scope.loginData.pin;
      var titleDisp = $sessionStorage.title;
      $state.go("app.p2_moduleList", {
        AppId: appId,
        title: titleDisp,
        "pin": pin
      });
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
    //======= onClick ========//
    $scope.onClick = function(formType, docQty) {
      if (0 < docQty) {

        var params = {
          AppId: $scope.appId,
          FormType: formType,
          Pin: appSettings.config.Pin
        };

        var docAppConfig = appSettings.MODULE_TYPES_FORWARD_PATH[formType];
        if (typeof docAppConfig === "undefined") {
          PelApi.throwError("client", "MODULE_TYPES_FORWARD_PATH", "Failed to locate MODULE_TYPES_FORWARD_PATH for FormType : " + formType);
        }
        $state.go(docAppConfig.state, params);
      }
    };

    //===========================================================//
    //== When        Who      Description                      ==//
    //== ----------  -------  ---------------------------------==//
    //== 23/02/2016  R.W.                                      ==//
    //===========================================================//
    $scope.ontouch = function(pushFlag) {
      pushFlag = !pushFlag;
    };

    //===========================================================//
    //== When        Who      Description                      ==//
    //== ----------  -------  ---------------------------------==//
    //== 23/02/2016  R.W.                                      ==//
    //===========================================================//
    $scope.insertOnTouchFlag = function(arr) {
      var myArr = [];
      for (var i = 0; i < arr.length; i++) {

        var myObj = {
          DOCUMENT_QTY: arr[i].DOCUMENT_QTY,
          MODULE_DESC: arr[i].MODULE_DESC,
          MODULE_NAME: arr[i].MODULE_NAME,
          PUSH_FLAG: true
        };

        myArr.push(myObj);

      } // for;
      return myArr;
    } // insertOnTouchFlag

    //===================== Refresh ===========================//
    $scope.doRefresh = function() {

      $scope.menuPageData = srvShareData.getData();
      $scope.btn_class = {};
      $scope.btn_class.on_release = true;

      PelApi.showLoading();

      var appId = $stateParams.AppId;
      var pin = $stateParams.Pin;
      var titleDisp = $stateParams.Title;

      $sessionStorage.DOC_ID = "";

      appSettings.config.token = $sessionStorage.token;
      appSettings.config.userName = $sessionStorage.userName;
      if (appSettings.config.network === "" || appSettings.config.network === undefined) {
        appSettings.config.network = $scope.menuPageData[0].PeleNetwork;
      }
      if (appSettings.config.MSISDN_VALUE === "" || appSettings.config.MSISDN_VALUE === undefined) {
        appSettings.config.MSISDN_VALUE = $scope.menuPageData[0].PeleMsisdnValue;
      }

      var links = PelApi.getDocApproveServiceUrl("GetUserModuleTypes");

      var retUserModuleTypes = PelApi.getUserModuleTypes(links, appId, pin);

      retUserModuleTypes.success(function(data, status) {

        $scope.feeds_categories = [];

        var stat = PelApi.getApiStatus(data, "getUserModuleTypes");
        var pinCodeStatus = stat.status;

        if ("Valid" === pinCodeStatus) {
          appSettings.config.GetUserModuleTypes = data;

          if (appSettings.config.GetUserModuleTypes.Response.OutParams !== null) {

            var category_sources = $scope.insertOnTouchFlag(appSettings.config.GetUserModuleTypes.Response.OutParams.MOBILE_MODULE_REC);

            $scope.category_sources_length = appSettings.config.GetUserModuleTypes.Response.OutParams.MOBILE_MODULE_REC.length;

            $scope.category_sources = category_sources; //appSettings.config.GetUserModuleTypes.Response.OutParams.MOBILE_MODULE_REC;
          }

        } else if ("PWA" === pinCodeStatus) {
          var errordesc = appSettings.PIN_STATUS.PWA;
          //var appId = $stateParams.AppId;
          var appId = $scope.appId;
          var titleDisp = $stateParams.title;
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();

        } else if ("PCR" === pinCodeStatus) {
          $scope.loginData.error = appSettings.PIN_STATUS.PAD;
          var appId = $scope.appId;;
          var titleDisp = $stateParams.title;
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
        } else if ("PAD" === pinCodeStatus) {
          //PelApi.showPopup(appSettings.config.pinCodeSubTitlePDA, "");
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
        } else if ("PNE" === pinCodeStatus) {
          PelApi.showPopup(appSettings.config.pinCodeSubTitlePNE, "");
        } else if ("NRP" === pinCodeStatus) {
          PelApi.showPopup(appSettings.config.pinCodeSubTitleNRP, "");
        } else if ("InValid" === pinCodeStatus) {
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
        } else if ("EAI_ERROR" === pinCodeStatus) {
          //PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
          PelApi.throwError("eai", "GetUserModuleTypes", JSON.stringify(data));
        } else if ("EOL" === pinCodeStatus) {
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
        } else if ("ERROR_CODE" === pinCodeStatus) {
          PelApi.throwError("app", "GetUserModuleTypes", JSON.stringify(data));
          //PelApi.showPopup(stat.description, "");
        } else if ("OLD" === pinCodeStatus) {
          PelApi.showPopupVersionUpdate(data.StatusDesc, "");
        }

      }).error(
        function(error, httpStatus, headers, config) {
          var time = config.responseTimestamp - config.requestTimestamp;
          var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
          PelApi.throwError("api", "GetUserModuleTypes", "httpStatus : " + httpStatus + tr)
        }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }; // doRefresh
    //======= dats section ====//
    $scope.category_sources = [];
    $scope.btn_class = {};
    $scope.btn_class.on_release = true;
    $scope.doRefresh();

  })
