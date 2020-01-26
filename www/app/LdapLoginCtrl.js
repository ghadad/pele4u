angular.module('pele', ['ngStorage'])
  .controller('LdapLoginCtrl', function ($scope, $state, $rootScope, PelApi, $http, $ionicLoading, BioAuth, $ionicModal) {
    //------------------------------------------------------------//
    //--                    Get AppId                           --//
    //------------------------------------------------------------//
    if($state.params.reset)
       BioAuth.clear();

    $scope.authMethod = BioAuth.getMethod();
    
    $scope.bioAuthRegistered = _.get(PelApi.localStorage, 'ADAUTH.cred', "");
    
    $scope.bioErrMessage1 = "שגיאה בהפעלת זיהוי ביומטרי" ; 
    $scope.bioErrMessage2 = "נסו שוב או  הזדהו באמצעות סיסמא חד פעמית" ; 

    $scope.regTitle = $scope.title = "התחברות עם משתמש וסיסמה";
    $scope.authTitle = "ניהול שיטות זיהוי";
    $scope.user = {
      password: null,
      username: null
    }
    $scope.error = null;
    $scope.activeForm = false;
    $scope.bioCap = null;
    $scope.doRender = false;

    BioAuth.getCap().then(function (result="") {
      if(result.match(/bio/i))
          $scope.bioCap = "bio";
          else if (result.match(/finger/i))
          $scope.bioCap = "finger";
          else if (result.match(/face/i))
          $scope.bioCap = "face";
    }).catch(function () {
      PelApi.lagger.info("bioAuth not exists for this device");
    }).finally(function(){ 
      $scope.doRender = true;
    })


    $ionicModal.fromTemplateUrl('authMethods.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function () {
      $scope.title = $scope.authTitle
      $scope.activeForm = false;
      $scope.modal.show();
    };


    $scope.setAuthMethod = function (method) {
      $scope.authMethod = method;
      BioAuth.setMethod(method);
      $scope.closeModal();
    }


    $scope.closeModal = function (backToMenu) {
      $scope.title = $scope.regTitle
      $scope.modal.hide();
      if(backToMenu)
      setTimeout(function () {
        $scope.activeForm = true;
      //  return $state.go("app.p1_appsLists");
      }, 100)

    };
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
    $scope.$on('modal.hidden', function () {
      $scope.title = $scope.regTitle
      setTimeout(function () {
        $scope.activeForm = true;
      }, 100)
      // Execute action
    });

    $scope.doLogIn = function () {
      $scope.error = "";
      if (!($scope.user.username && $scope.user.password)) {
        $scope.error = "יש להזין שם משתמש וסיסמה";
      }
      PelApi.showLoading();

      var user = _.trim($scope.user.username);
      var password = _.trim($scope.user.password);

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
            password: password,
            msisdn:PelApi.appSettings.config.MSISDN_VALUE
          };
          if (BioAuth.isInstalled()  && BioAuth.getMethod().match(/finger|face|bio/)) {
            BioAuth.show().then(function (hashkey) {
              BioAuth.setCredentials(credentials,hashkey).
              then(function(result){
                return $state.go("app.p1_appsLists");
              }).catch(function(err){
                PelApi.showPopup($scope.bioErrMessage1,$scope.bioErrMessage2);        
                $state.reload();
              })
            }).catch(function (error) {
              $state.reload();
            })
          } else {
            return $state.go("app.p1_appsLists");
          }
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
    }

    if (BioAuth.isInstalled()  && BioAuth.getMethod().match(/finger|face|bio/)) {
      BioAuth.show().then(function (hashkey) {
        BioAuth.getCredentials(hashkey).
        then(function(decryptedCredentials){
          $scope.user = decryptedCredentials
          $scope.activeForm = false;
          return $scope.doLogIn();
        }).catch(function(err){
          PelApi.showPopup($scope.bioErrMessage1,$scope.bioErrMessage2);        
          $state.reload();
        })
      }).catch(function (error) {
        $state.reload();
      })
    } else {
      setTimeout(function () {
        $scope.openModal();
      }, 100);
      $scope.activeForm = true;
    }
  });