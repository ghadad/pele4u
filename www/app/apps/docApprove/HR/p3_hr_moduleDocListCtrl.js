/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('p3_hr_moduleDocListCtrl', function($scope, $stateParams, $http, $q, $ionicLoading, $state, PelApi, $cordovaNetwork, $sessionStorage, appSettings) {

    $scope.appId = $stateParams.AppId;
    //---------------------------------
    //--       goHome
    //---------------------------------
    $scope.goHome = function() {
      PelApi.goHome();
    }

    //----------------------- REFRESH ------------------------//
    $scope.doRefresh = function() {

      PelApi.showLoading();

      var sessionDocId = $sessionStorage.DOC_ID;
      $scope.toggleGroup(sessionDocId);

      //var appId = $stateParams.AppId,
      var appId = $stateParams.AppId,
        formType = $stateParams.FormType,
        pin = $stateParams.Pin;

      var links = PelApi.getDocApproveServiceUrl("GtUserFormGroups");

      var retGetUserFormGroups = PelApi.GetUserFormGroups(links, appId, formType, pin);

      retGetUserFormGroups.success(function(data, status, headers, config) {



        var stat = PelApi.GetPinCodeStatus2(data, "GetUserFormGroups");
        var pinStatus = stat.status;

        if ("Valid" === pinStatus) {

          if (data.Response.OutParams.ROW[0].DOC_NAME === null) {
            //$state.go("app.p1_appsLists");
            //appSettings.config.IS_TOKEN_VALID = "N";
            PelApi.goHome();
          } else {
            $scope.docsGroups = data.Response.OutParams.ROW;

            $scope.title = "";
            var rowLength = $scope.docsGroups.length;
            if (rowLength > 0) {
              $scope.title = $scope.docsGroups[0].DOC_TYPE;
            }
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
          }
        } else if ("PDA" === pinStatus) {

          $scope.login();

        } else if ("InValid" === pinStatus) {

          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();

        } else if ("EAI_ERROR" === pinStatus) {

          PelApi.throwError("eai", "GetUserFormGroups", JSON.stringify(data));

        } else if ("EOL" === pinStatus) {
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
        } else if ("ERROR_CODE" === pinStatus) {
          PelApi.throwError("app", "GetUserFormGroups", JSON.stringify(data));
        }
      }).error(function(error, httpStatus, headers, config) {
        var time = config.responseTimestamp - config.requestTimestamp;
        var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
        PelApi.throwError("api", "GetUserFormGroups", "httpStatus : " + httpStatus + tr)
      }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });

    };
    //---------------------------------------------------------
    //-- When        Who       Description
    //-- ==========	 ========  ================================
    //-- 20/10/2015  R.W.      Accordion functions
    //---------------------------------------------------------
    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };
    //----------------------------------------------------------
    //-- Search bar JSON rebild
    //----------------------------------------------------------
    $scope.searchBarCreteria = function() {
      var searchText = $scope.searchText.text;
      if ($scope.searchText.text !== undefined && $scope.searchText.text !== "") {
        list = $scope.docsGroups;
        for (var i = 0; i < list.length; i++) {
          var sCount = 0;
          for (var j = 0; j < list[i].DOCUMENTS.DOCUMENTS_ROW.length; j++) {
            var owner = list[i].DOCUMENTS.DOCUMENTS_ROW[j].MESSAGE;
            var n = owner.indexOf(searchText);
            if (-1 !== n) {
              sCount++;
            }
          }
          $scope.docsGroups[i].FORM_QTY = sCount;
        }
      } else {
        for (var i = 0; i < list.length; i++) {
          var sCount = list[i].DOCUMENTS.DOCUMENTS_ROW.length;
          $scope.docsGroups[i].FORM_QTY = sCount;
        }
      }
    }; //

    $scope.fix_json = function(data) {
      /*
      var newData = JSON.parse( data.Response.OutParams.Result );
      var myJSON = newData.JSON[0];
      newData = myJSON;
      */
      var newData = {};
      var myJSON = {};

      if (data.Response.OutParams.Result === undefined) {
        data.Response.OutParams.Result = {};
      } else {
        newData = JSON.parse(data.Response.OutParams.Result);
        myJSON = newData.JSON[0];

        if (myJSON.DOC_LINES.length === undefined) {
          var docLinesRow = myJSON.DOC_LINES.DOC_LINES_ROW;
          myJSON.DOC_LINES = [];
          myJSON.DOC_LINES.DOC_LINES_ROW = docLinesRow;
        }
        newData = myJSON;
        data.Response.OutParams.Result = newData;
      }

      return data;

    }

    //--------------------------------------------------------------
    //-- When        Who         Description
    //-- ----------  ----------  -----------------------------------
    //-- 01/11/2015  R.W.        function forward to page by DOC_ID
    //--------------------------------------------------------------
    $scope.forwardToDoc = function(docId, docInitId) {
      //var appId = $stateParams.AppId;
      var appId = $scope.appId;
      var statePath = 'app.doc_' + docId;

      PelApi.showLoading();

      var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");

      var retGetUserNotifications = PelApi.GetUserNotifications(links, appId, docId, docInitId);
      retGetUserNotifications.success(function(data, status, headers, config) {
        data = $scope.fix_json(data)
        var stat = PelApi.GetPinCodeStatus2(data, "GetUserNotifNew");
        var pinStatus = stat.status;

        if ("Valid" === pinStatus) {

          var newData = data.Response.OutParams.Result;

          appSettings.config.docDetails = newData;

          var buttonsLength = 0;

          if (appSettings.config.docDetails.BUTTONS.length !== undefined) {
            buttonsLength = appSettings.config.docDetails.BUTTONS.length;
          }

          if (2 === buttonsLength) {
            appSettings.config.ApprovRejectBtnDisplay = true;
          } else {
            appSettings.config.ApprovRejectBtnDisplay = false;
          }

          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');

          $state.go(statePath, {
            "AppId": appId,
            "DocId": docId,
            "DocInitId": docInitId
          });

        } else if ("PDA" === pinStatus) {

          $scope.login();

        } else if ("InValid" === pinStatus) {

          //$state.go("app.p1_appsLists");
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();

        } else if ("EOL" === pinStatus) {

          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();

        } else if ("EAI_ERROR" === pinStatus) {
          PelApi.throwError("eai", "GetUserNotifNew", JSON.stringify(data));
          //PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");

        } else if ("ERROR_CODE" === pinStatus) {
          PelApi.throwError("app", "GetUserNotifNew", JSON.stringify(data));
          //PelApi.showPopup(stat.description, "");

        } else if ("OLD" === pinStatus) {

          PelApi.showPopupVersionUpdate(data.StatusDesc, "");

        }
      }).error(function(error, httpStatus, headers, config) {
        var time = config.responseTimestamp - config.requestTimestamp;
        var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
        PelApi.throwError("api", "GetUserNotifNew", JSON.stringify(error) + tr);
      }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    } // forwardToDoc

    $scope.feed = [];
    $scope.searchText = {};
    $scope.doRefresh();

  });
