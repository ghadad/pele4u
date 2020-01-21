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
        PelApi.sessionStorage.ADAUTH = _.get(data, 'ADLoginResult', {});
        PelApi.appSettings.config.token = PelApi.sessionStorage.ADAUTH.token;
        var msisdn = PelApi.sessionStorage.ADAUTH.msisdn.replace(/^05/, "9725");
        PelApi.appSettings.config.MSISDN_VALUE = PelApi.localStorage.PELE4U_MSISDN = PelApi.sessionStorage.PELE4U_MSISDN = msisdn;
        if (!(PelApi.appSettings.config.MSISDN_VALUE && PelApi.appSettings.config.token))
          return PelApi.throwError("api", "ADLogin", "Cannot retreive msisdn or token from ADLogin service", true);
        return $state.go("app.p1_appsLists");
      }).error(
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
          clientId: 'Fingerprint-Demo',
          clientSecret: 'password', //Only necessary for Android
          disableBackup:true,  //Only for Android(optional)
          localizedFallbackTitle: 'Use Pin', //Only for iOS
          localizedReason: 'Please authenticate' //Only for iOS
        }, successCallback, errorCallback);

        function successCallback(res) {
          alert("Authentication successfull:"+res);
        }

        function errorCallback(err) {
          alert("Authentication invalid " + err);
        }
      }
    }

  });