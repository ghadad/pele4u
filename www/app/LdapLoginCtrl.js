angular.module('pele', ['ngStorage'])
  .controller('LdapLoginCtrl', function ($scope, $state, $ionicSideMenuDelegate, PelApi, $http, $ionicLoading, BioAuth, $ionicModal,$timeout) {
    //------------------------------------------------------------//
    //--                    Get AppId                           --//
    //------------------------------------------------------------//

    
    $scope.hideAllforms = false;
    $scope.focusMe = function(event) {   
      var ae =     event.target;
      $timeout(function() {
       // document.activeElement.selectionStart = document.activeElement.selectionEnd;
      //  console.log(document.activeElement.selectionEnd)
      ae.focus()
      },300)      
    }

    if($state.params.reset ) 
       BioAuth.clear();
        
  $scope.checkTries = function() { 
    var tries = _.get(PelApi.sessionStorage,'stat.bioFailed',0);
    if(tries>=5)    
        BioAuth.clear("soft");
    _.set(PelApi.sessionStorage, 'stat.bioFailed',tries+1);
  }

  $scope.toggleRight = function(){
    $ionicSideMenuDelegate.toggleRight();
};

  $scope.resetTries = function() { 
    var tries = _.set(PelApi.sessionStorage,'stat.bioFailed',0);
  }
    
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
      animation: 'slide-in-up',
      backdropClickToClose:true
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function () {
      $scope.title = $scope.authTitle
      $scope.activeForm = false;
     // $scope.modal.show();
    };


    $scope.setAuthMethod = function (method) {
      $scope.authMethod = method;
      BioAuth.setMethod(method);
      $scope.activeForm = true;
      $scope.closeModal();
    }


    $scope.closeModal = function (backToMenu) {
      $scope.title = $scope.regTitle
     // $scope.modal.hide();
      if(backToMenu)
      setTimeout(function () {
        $scope.activeForm = true;
      //  return $state.go("app.p1_appsLists");
      }, 100)

    };
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function (event, modal) {
  
     
      $scope.title = $scope.regTitle
      setTimeout(function () {
        $scope.activeForm = true;
      //  $ionicSideMenuDelegate.toggleRight();
      }, 100)
      // Execute action
    });

    $scope.doLogIn = function (isBio) {
      
      $scope.error = "";
      $scope.error2 = "";

      if (!($scope.user.username && $scope.user.password)) {
        $scope.error = "יש להזין שם משתמש וסיסמה";
      }
      PelApi.showLoading();

      var user = _.trim($scope.user.username).replace(/\@.+/,"");
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
          if(!BioAuth.getMethod()) { 
            $scope.error = "לא בחרת שיטת  זיהוי"
            $scope.doRender = true;
            throw new Error("no method selected")
          }

          if(!adLoginInfo.msisdn) { 
            $scope.error = "שגיאה בהפעלת אימות משתמש"
            throw new Error("Failed to get data from ADLogin")
          }

          adLoginInfo.appId = _.get(adLoginInfo, 'menuItems[0].AppId');
          adLoginInfo.msisdn = _.get(adLoginInfo, 'msisdn', "").replace(/^05/, "9725");
          PelApi.sessionStorage.ADAUTH = adLoginInfo;
          PelApi.appSettings.config.IS_TOKEN_VALID = 'Y'
          PelApi.appSettings.config.token = PelApi.sessionStorage.ADAUTH.token;

          PelApi.appSettings.config.MSISDN_VALUE = PelApi.localStorage.PELE4U_MSISDN = PelApi.sessionStorage.PELE4U_MSISDN = adLoginInfo.msisdn;
          var credentials = {
            username: user,
            password: password,
            msisdn:PelApi.appSettings.config.MSISDN_VALUE
          };


          _.set(PelApi.localStorage, 'ADAUTH.username',user);

          if (!_.get(PelApi.localStorage, 'ADAUTH.token',null) &&  BioAuth.isInstalled()  && BioAuth.getMethod().match(/finger|face|bio/)) {
              $scope.hideAllforms = true;
              BioAuth.encrypt(credentials).
              then(function(result){
                _.set(PelApi.localStorage, 'ADAUTH.token', result.token);
                $scope.resetTries();
                return $state.go("app.p1_appsLists");
              }).catch(function(err){
                
                $scope.checkTries();
                PelApi.showPopup($scope.bioErrMessage1,$scope.bioErrMessage2);        
                $state.reload();
              })
            
          } else {
            return $state.go("app.p1_appsLists");
            /*
            var svConf = PelApi.getDocApproveServiceUrl("IsSessionValidJson", "login");
            PelApi.IsSessionValidJson(svConf, adLoginInfo.appId, adLoginInfo.PinCode).
            success(function () {
              
            }).error(function () {
              
            }).finally(function() { 
              return $state.go("app.p1_appsLists");
            });
            */
          }
        })
        .error(
          function (errorStr, httpStatus, headers, config) {
            $scope.hideAllforms = false;
            $scope.activeForm = true;
            var time = config.responseTimestamp - config.requestTimestamp;
            $scope.user.password = "";

            var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
            if(isBio)
            $scope.error = "זוהתה סיסמא שגויה באפליקציה, יש לבצע הזדהות מחדש עם שם המשתמש והסיסמא של המחשב"
            else
            $scope.error = "שם משתמש או סיסמה לא נכונים"
            
          }
        ).finally(function () {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
    }

    
    
    
    if(PelApi.appSettings.config.IS_TOKEN_VALID == "Y" && PelApi.localStorage.PELE4U_MSISDN ) {
      if(_.get(PelApi.sessionStorage,'ADAUTH.token'))
      PelApi.appSettings.config.token = PelApi.sessionStorage.ADAUTH.token;
      if(_.get(PelApi.sessionStorage,'ADAUTH.msisdn'))
          PelApi.appSettings.config.MSISDN_VALUE = PelApi.sessionStorage.PELE4U_MSISDN = _.get(PelApi.sessionStorage,'ADAUTH.msisdn');
      return $state.go("app.p1_appsLists");
    }

    if(BioAuth.getMethod().match(/pincode/) && PelApi.appSettings.config.IS_TOKEN_VALID != "Y" ) {
      PelApi.sessionStorage.$reset();
      return $state.go("app.p1_appsLists");
    }

    var token =  BioAuth.getToken();
    var bioUser = _.get(PelApi.localStorage, 'ADAUTH.username',null);
        
    
    if (PelApi.appSettings.config.IS_TOKEN_VALID != "Y" && bioUser && token && BioAuth.isInstalled()  && BioAuth.getMethod().match(/finger|face|bio/) ) {
      $scope.hideAllforms = true;
         BioAuth.decrypt(bioUser,token).
         then(function(decryptedCredentials){
          $scope.user = decryptedCredentials
          $scope.activeForm = false;
          $scope.resetTries();
          return $scope.doLogIn(true);
        }).catch(function(err){

          $scope.checkTries();
          PelApi.showPopup($scope.bioErrMessage1,$scope.bioErrMessage2);        
         // $state.reload();
        })
    } else {
      
      BioAuth.clear("soft");
      if(BioAuth.getMethod() == "pincode") { 
        $scope.activeForm = true;
        return ;
      }
      
      setTimeout(function () {
        $scope.activeForm = true;
        $scope.openModal();
      }, 100);

    }
  });
 