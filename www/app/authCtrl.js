/**
 * Created by User on 06/09/2016.
 */
var app = angular.module('pele.authCtrl', ['ngStorage']);

app.controller('LoginCtrl', function($scope, $state,  PelApi, $sessionStorage, $ionicLoading, appSettings,$timeout) {
  //------------------------------------------------------------//
  //--                    Get AppId                           --//
  //------------------------------------------------------------//
  PelApi.lagger.info(" LoginCtrl controller");
  
  $scope.getAppId = function() {

    var menuList = appSettings.config.GetUserMenu;

    var pinCodeReq = "N";
    var appId = "";

    if (menuList.menuItems !== undefined) {
      var appList = menuList.menuItems;
      var length = appList.length;

      for (var i = 0; i < length; i++) {
        var pin = appList[i].Pin
        if (pin !== false) {
          pinCodeReq = "Y";
          appId = appList[i].AppId;
          i = length;
        }
      }
    }

    return appId;

  } 
  
    
  $scope.focusMe = function(event) {   
    var ae =     event.target;
    $timeout(function() {
     // document.activeElement.selectionStart = document.activeElement.selectionEnd;
    //  console.log(document.activeElement.selectionEnd)
    ae.focus()
    },300)      
  }

  // getAppId
  //------------------------------------------------------------//
  //--                                                        --//
  //------------------------------------------------------------//
  $scope.doLogIn = function() {


    PelApi.showLoading();

    var links = PelApi.getDocApproveServiceUrl("IsSessionValidJson");

    var appId = PelApi.getAppId();
    var pin = $scope.user.pin;
    $scope.user.pin = "";

    if (appId !== "") {
      var retIsSessionValidJson = PelApi.IsSessionValidJson(links, appId, pin);
      retIsSessionValidJson.then(
        //--- SUCCESS ---//
        function() {

          retIsSessionValidJson.success(function(data, status, headers, config) {

            var pinStatus = data;
            PelApi.lagger.info("=========== IsSessionValidJson ================");
            PelApi.lagger.info(JSON.stringify(data));

            if ("Valid" === pinStatus) {
              
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              appSettings.config.Pin = pin;

              
              appSettings.config.IS_TOKEN_VALID = "Y";
              PelApi.sessionStorage.newValidPinCode = pin;

              $sessionStorage.AuthInfo = {
                pinCode: appSettings.config.Pin,
                token: appSettings.config.token
              };


              PelApi.pinState.set({
                valid: true,
                code: appSettings.config.Pin,
                apiCode: pinStatus
              })
              
              $state.go('app.p1_appsLists');
            } else if ("PWA" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              $scope.user.message = appSettings.config.pinCodeSubTitlePWA;
              $scope.user.pin = "";
            } else if ("PAD" === pinStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.goHome();

            } else if ("InValid" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              //$state.go("app.p1_appsLists");
              PelApi.goHome();

            } else if ("EAI_ERROR" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");

            } else if ("EOL" === pinStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.goHome();

            } else if ("ERROR_CODE" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(stat.description, "");
            }
          }).error(function(data, status, headers, config) {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(appSettings.config.getUserModuleTypesErrorMag, "");
          });
        }
        //--- ERROR ---//
        ,
        function(response) {

          PelApi.lagger.error("========== IsSessionValidJson ERROR ==========");
          PelApi.lagger.error(JSON.stringify(response));
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          PelApi.showPopup(appSettings.config.getUserModuleTypesErrorMag, "");
        }
      ); /// then
    }
  }; // doLogIn

  $scope.user = {};
  $scope.user.pin = "";
  $scope.user.message = "";
  $scope.TITLE_OTP_INPUT = appSettings.config.TITLE_OTP_INPUT;
  $scope.TITLE_SYSTEM_MESSAGES = appSettings.config.TITLE_SYSTEM_MESSAGES;
  $scope.TITLE_LOGIN = appSettings.config.TITLE_LOGIN;
  $scope.TITLE_SEND_OTP = appSettings.config.TITLE_SEND_OTP;
  $scope.TITLE_RESET_PASSWORD_LINK = appSettings.config.TITLE_RESET_PASSWORD_LINK;
});

app.controller('ForgotPasswordCtrl', function($scope, $state) {
  $scope.recoverPassword = function() {
    $state.go('app.login');
  };
  $scope.TITLE_FORGOT_PASSWORD = appSettings.config.TITLE_FORGOT_PASSWORD;
  $scope.TITLE_OTP_REQUEST = appSettings.config.TITLE_OTP_REQUEST;
  $scope.TITLE_SEND_OTP_LINK = appSettings.config.TITLE_SEND_OTP_LINK;
  $scope.user = {};
  $scope.user.pin = "";
  $scope.user.phone = appSettings.config.MSISDN_VALUE;
});