angular.module('pele', ['ngStorage'])
  .controller('LdapLoginCtrl', function ($scope, $state, $rootScope, PelApi, $http, $ionicLoading,BioAuth,$ionicModal) {
    //------------------------------------------------------------//
    //--                    Get AppId                           --//
    //------------------------------------------------------------//


    $scope.authMethod =  _.get(PelApi.localStorage,'ADAUTH.method',"") ||"";
    $scope.bioAuthRegistered = _.get(PelApi.localStorage,'ADAUTH.cred',"");

    $scope.regTitle = $scope.title = "התחברות עם משתמש וסיסמה" ;
    $scope.authTitle = "ניהול שיטות זיהוי";
    $scope.user = {
      password: null,
      username: null
    }
    $scope.error = null;
    $scope.activeForm =false;


    $ionicModal.fromTemplateUrl('authMethods.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    

    $scope.openModal = function() {
      $scope.title =  $scope.authTitle
      $scope.activeForm = false;
      $scope.modal.show();
    };

    
    $scope.setAuthMethod= function(method) {
      $scope.authMethod = method;

      _.set(PelApi.localStorage,'ADAUTH.method',method);
      $scope.closeModal();
    }


    $scope.closeModal = function() {
      $scope.title =  $scope.regTitle
      $scope.modal.hide();
      setTimeout(function(){
        $scope.activeForm = true;
      },100)
      
    };
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.$on('modal.hidden', function() {
      $scope.title =  $scope.regTitle
      setTimeout(function(){
        $scope.activeForm = true;
      },100)
      // Execute action
    });

    $scope.doLogIn = function () {

      BioAuth.get().then(function (result) {
        return $state.go("app.p1_appsLists");
      }).catch(function (error) {
        PelApi.lagger.error("bioAuth not exists for this device",error.stack);
      })

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
          var credentials = {
            username: user,
            password: password
          };

          var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(credentials),PelApi.appSettings.config.token).toString();

        _.set(PelApi.localStorage,'ADAUTH.cred', {
          cipher: ciphertext,
          token:PelApi.appSettings.config.token,
          msisdn:PelApi.appSettings.config.MSISDN_VALUE
        });


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



      /**
       * @return {
       *      isAvailable:boolean,
       *      isHardwareDetected:boolean,
       *      hasEnrolledFingerprints:boolean
       *   }
       */


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

        function successCallback(res) {
          console.log("success bioAuth:", res)
          alert("Authentication successfull", res);
        }
        function errorCallback(err) {
          console.log("error  bioAuth:", err.stack)
          alert("Authentication invalid " + err);
        }
      }
    }

    var adAuth = _.get(PelApi.localStorage,'ADAUTH.cred1',{});
    if(adAuth.token && adAuth.cipher) { 
      var bytes  = CryptoJS.AES.decrypt(adAuth.cipher,adAuth.token);
      var decryptedCredentials = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
       $scope.user = decryptedCredentials
       $scope.activeForm = false;
       $scope.doLogIn();
    } else{
      setTimeout(function() { $scope.openModal();},100);
      $scope.activeForm = true;
    }
  });