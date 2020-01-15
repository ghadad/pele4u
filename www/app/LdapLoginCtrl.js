angular.module('pele', ['ngStorage'])
  .controller('LdapLoginCtrl', function ($scope, $state, $rootScope, PelApi, $sessionStorage,StorageService, ApiService) {
    //------------------------------------------------------------//
    //--                    Get AppId                           --//
    //------------------------------------------------------------//

    $scope.user = {
      password: null,
      username: null
    }
    $scope.error = null ;
    
    $scope.doLogIn = function () {
      if(!($scope.user.username && $scope.user.password) ) {
        $scope.error = "יש להזין שם משתמש וסיסמה" ;
      }
      //PelApi.showLoading();
      $sessionStorage.ApiServiceAuthParams = {TOKEN:"xxxxxx",PIN:12345}
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
        
        if(typeof window.Fingerprint == "undefined") { 
          PelApi.lagger.info("FingerprintAuth plugin not available in the device")
        }
        
        let touchAuthObject =  window.Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);

        PelApi.lagger.info("touchAuthObject",touchAuthObject);

        window.Fingerprint.show({
          clientId: "Fingerprint-Demo", //Android: Used for encryption. iOS: used for dialogue if no `localizedReason` is given.
          clientSecret: "o7aoOMYUbyxaD23oFAnJ" //Necessary for Android encrpytion of keys. Use random secret key.
        }, successCallback, errorCallback);
    
        function successCallback(){
          alert("Authentication successfull");
        }
    
        function errorCallback(err){
          alert("Authentication invalid " + err);
        }
      
    }

  });