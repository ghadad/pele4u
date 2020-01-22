angular.module('pele', ['ngStorage'])
  .controller('LdapLoginCtrl', function ($scope, $state, $rootScope, PelApi, $http, $ionicLoading) {
      //------------------------------------------------------------//
      //--                    Get AppId                           --//
      //------------------------------------------------------------//

      $scope.user = {
        password: null,
        username: null
      }
      $scope.error = null;

      $scope.doLogIn = function () {
        $scope.error = "";
        if (!($scope.user.username && $scope.user.password)) {
          $scope.error = "יש להזין שם משתמש וסיסמה";
        }
        //PelApi.showLoading();

        var user = _.trim($scope.user.username);
        var password = _.trim($scope.user.password);

        if (user + password === "testtest") {

        }
        var httpConf = PelApi.getDocApproveServiceUrl('ADLogin');

        var promise = $http({
          url: httpConf.url,
          method: "POST",
          data: {
            UserName: user,
            password: password
          },
          timeout: httpConf.timeout || PelApi.appSettings.menuTimeout,
          retry: 1,
          headers: httpConf.headers
        });



        promise.success(function (data, status, headers, config) {
          var adLoginInfo = _.get(data, 'ADLoginResult', {});
          adLoginInfo.appId = _.get(adLoginInfo, 'menuItems[0].AppId');
          adLoginInfo.msisdn = _.get(adLoginInfo, 'msisdn', "").replace(/^05/, "9725");
          PelApi.sessionStorage.ADAUTH = adLoginInfo;
          PelApi.appSettings.config.token = PelApi.sessionStorage.ADAUTH.token;
          PelApi.appSettings.config.MSISDN_VALUE = PelApi.localStorage.PELE4U_MSISDN = PelApi.sessionStorage.PELE4U_MSISDN = adLoginInfo.msisdn;
          $state.go("app.p1_appsLists");
        })
        .error(
      function (errorStr, httpStatus, headers, config) {
        var time = config.responseTimestamp - config.requestTimestamp;
        var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
        $scope.error = "שם משתמש או סיסמה לא נכונים"
      }
    ).finally(function () {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });

    _.set(PelApi.sessionStorage.BIOAUTH, {
      face: true,
      finger: true
    })



    /*  ApiService.post("PhonebookGetSector", "dum")
      .success(function(data, status, headers, config) {
        var result = ApiService.checkResponse(data, status, config)
        $scope.sectors = result.sectors;
        $scope.operunits = result.operunits;
        StorageService.set("phonebook_sectors", result, 60 * 60 * 1000)
      })
      .error(function(errorStr, httpStatus, headers, config) {
        console.log("errorstr:",errorStr)
        console.log("httpStatus:",httpStatus)
        ApiService.checkResponse({
          error: errorStr
        }, httpStatus, config);

      }).finally( function() { 
        PelApi.hideLoading();
      })
    */
    /**
     * @return {
     *      isAvailable:boolean,
     *      isHardwareDetected:boolean,
     *      hasEnrolledFingerprints:boolean
     *   }
     */


    function isAvailableSuccess(result) {
      PelApi.lagger.info("FingerprintAuth available: " + JSON.stringify(result));
      if (result.isAvailable) {
        var encryptConfig = {}; // See config object for required parameters
        FingerprintAuth.encrypt(encryptConfig, encryptSuccessCallback, encryptErrorCallback);
      }
    }

    function isAvailableError(message) {
      PelApi.lagger.error("isAvailableError(): " + message);

    }
    PelApi.lagger.info("before Auth touch!");

    if (typeof window.Fingerprint == "undefined") {
      PelApi.lagger.info("FingerprintAuth plugin not available in the device")
    }

    if (window.Fingerprint) {

      $scope.touchAuthObject = window.Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);

      PelApi.lagger.info("touchAuthObject", touchAuthObject);

      window.Fingerprint.show({
        clientId: "Fingerprint-Demo", //Android: Used for encryption. iOS: used for dialogue if no `localizedReason` is given.
        clientSecret: "o7aoOMYUbyxaD23oFAnJ" //Necessary for Android encrpytion of keys. Use random secret key.
      }, successCallback, errorCallback);

      function successCallback() {
        alert("Authentication successfull");
      }

      function errorCallback(err) {
        alert("Authentication invalid " + err);
      }
    }
  }

});