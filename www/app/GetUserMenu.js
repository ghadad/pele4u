/**
 * Created by User on 08/09/2016.
 */
var app = angular.module('pele.GetUserMenu', ['ngStorage', 'ngCordova']);
//=====================================================================//
//==                         PAGE_1                                  ==//
//=====================================================================//
app.controller('GetUserMenuCtrl',
  function ($scope, $http, $state, $ionicLoading, PelApi, ApiGateway, $rootScope, $ionicPopup, $ionicHistory, $sessionStorage, $localStorage, appSettings, srvShareData, $cordovaNetwork, $ionicNavBarDelegate,BioAuth) {

    $ionicNavBarDelegate.showBackButton(true);
    $ionicHistory.clearHistory();
    PelApi.lagger.checkFile().then(function (logStat) {
      if (logStat.size > (1024 * 1024)) {
        PelApi.lagger.deleteLogfile().then(function () {
          PelApi.lagger.error("flush Log file ...  log too big ...( > 1MB) ")
        })
      }
    })
    //$ionicScrollDelegate.$getByHandle('menu1-handle').scrollTo('300px');

    $rootScope.menuItems = [];
    $scope.options = {
      loop: true,
      effect: 'fade',
      speed: 500,
    }

    $scope.showMenu = false;
    $scope.iphonex = window.iphonex;
    $scope.deviceModel = window.deviceModel;

    $scope.wellcome = "";
    $scope.getWellcomeString = function () {
      $scope.timeRange = _.toNumber(moment().format("H"))
      if ($scope.timeRange >= "05" && $scope.timeRange < "11") {
        $scope.wellcome = "בוקר טוב";
      } else if ($scope.timeRange >= "11" && $scope.timeRange < "14") {
        $scope.wellcome = "צהריים טובים";
      } else if ($scope.timeRange >= "14" && $scope.timeRange < "18") {
        $scope.wellcome = "אחר צהריים טובים";
      } else if ($scope.timeRange >= "18" && $scope.timeRange < "22") {
        $scope.wellcome = "ערב טוב";
      } else {
        $scope.wellcome = "לילה טוב";
      }
    }
    setInterval(function () {
      $scope.getWellcomeString();
    }, 60)

    $scope.childOf = {};
    //$scope.tilesEnabled = true;
    $scope.sort = function (items) {

      /*  items[0].Sorter = "1@cls1 dsds ddssd";
      items[1].Sorter = "2@cls3";
      items[2].Sorter = "4.1@cls3";
      items[2].Path = null;
      items[3].Sorter = "4.1@wide";
      //items[3].Path = null;
      items[4].Sorter = "4";
      items[4].Path = null;
      */
      var re = new RegExp("(\\@[a-z]+[\\s\\w]+)", "gi")
      var idx = 0;
      var sortedMenu = _.sortBy(items, function (i) {
        idx++;
        i.menuLocation = i.Location || "side";
        i.side = i.menuLocation.match("side|s") ? true : false;
        i.menu1 = i.menuLocation.match("menu1|m1") ? true : false;
        i.menu2 = i.menuLocation.match("menu2|m2") ? true : false;
        i.newSorter = (i.Sorter || ("99" + idx).toString()).replace(re, "");
        i.level = (i.newSorter.match(/\./g) || []).length;
        i.parent = "mid_" + (i.newSorter.replace(/\.?\w+$/, "") || "0");
        i.menuId = "mid_" + i.newSorter;
        $scope.childOf[i.menuId] = i.parent;
        i.classes = (i.Sorter || "").match(re);
        if (i.classes) i.classes[0] = i.classes[0].replace('@', '')
        return i.newSorter;
      })

      return sortedMenu;
    }
    //=======================================================//
    //== When        Who         Description               ==//
    //== ----------  ----------  ------------------------- ==//
    //== 27/12/2015  R.W.                                  ==//
    //=======================================================//
    $scope.pushBtnClass = function (event) {
      if (event === true) {
        return "pele-item-on-release";
      } else {
        return "pele-item-on-touch";
      }
    } // pushBtnClass

    $scope.onBtnAction = function () {
      btnClass.activ = !btnClass.activ;
    };

    $scope.insertOnTouchFlag = function (arr) {
      var myArr = [];
      for (var i = 0; i < arr.length; i++) {
        var myObj = {
          AppId: arr[i].AppId,
          ApplicationType: arr[i].ApplicationType,
          DisplayName: arr[i].DisplayName,
          Image: arr[i].Image,
          Path: arr[i].Path,
          Pin: arr[i].Pin,
          WorkState: arr[i].WorkState,
          PUSH_FLAG: true
        };
        myArr.push(myObj);
      }

      return myArr;
    }

    /*
     * ==========================================================
     *                    GetUserMenuMain
     * ==========================================================
     */


    if ($localStorage.PELE4U_MSISDN) {
      appSettings.config.MSISDN_VALUE = $localStorage.PELE4U_MSISDN;
    }
    if ($sessionStorage.PELE4U_MSISDN) {
      appSettings.config.MSISDN_VALUE = $sessionStorage.PELE4U_MSISDN;
    }

    $scope.GetUserMenuMain = function () {
      $rootScope.menuItems = [];
      var links = PelApi.getDocApproveServiceUrl("GetUserMenu");

      try {
        var reMenu = PelApi.getMenu(links);
      } catch (e) {
        var isAndroid = ionic.Platform.isAndroid();
        if (isAndroid) {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          window.location = "./index.html";
        }
      }
 


      reMenu.success(function (data, status, headers, config) {
        PelApi.sessionStorage.ApiServiceAuthParams = {}
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
        if (headers('msisdn_res') !== undefined && headers('msisdn_res') !== null && headers('msisdn_res') != null) {
          appSettings.config.MSISDN_VALUE = headers('msisdn_res');
        } else {
          if (data.msisdn !== undefined && data.msisdn !== null && data.msisdn != null) {
            appSettings.config.MSISDN_VALUE = data.msisdn;
          }
        }

        $sessionStorage.PELE4U_MSISDN = appSettings.config.MSISDN_VALUE;
        $localStorage.PELE4U_MSISDN = appSettings.config.MSISDN_VALUE;
        _.set(PelApi.sessionStorage.ADAUTH,'msisdn',appSettings.config.MSISDN_VALUE);

        //$scope.setMSISDN(appSettings.config.MSISDN_VALUE);

        var pinCodeStatus = PelApi.GetPinCodeStatus(data, "getMenu");
        PelApi.lagger.info("GetUserMenu -> pinCodeStatus:", pinCodeStatus)
        if(PelApi.appSettings.env == 'DV' && data.ActivePin)
        alert("Pin code:"+data.ActivePin)
        
        if ("Valid" === pinCodeStatus) {
          appSettings.config.token = data.token;
          
          appSettings.config.user = data.user;
          appSettings.config.userName = data.userName;
          var strData = JSON.stringify(data);
          strData = strData.replace(/\"\"/g, null);
          strData = strData.replace(/"\"/g, "");
          appSettings.config.GetUserMenu = JSON.parse(strData);
          $scope.feeds_categories = appSettings.config.GetUserMenu;

          //$scope.feeds_categories.menuItems = $scope.insertOnTouchFlag($scope.feeds_categories.menuItems);
          $scope.visibleParent = "mid_0";

          $scope.feeds_categories.menuItems = $scope.sort($scope.feeds_categories.menuItems);
          $rootScope.menuItems = $sessionStorage.menuItems = $scope.feeds_categories.menuItems;
    
          //---------------------------------------------
          //-- Send User Tag for push notifications
          //---------------------------------------------
          if (window.plugins && window.plugins.OneSignal) {
            window.plugins.OneSignal.sendTags({
              "User": data.userName,
              "Env": appSettings.env
            });
          }
          //--------------------------------------
          //  Save Important Data in session
          //--------------------------------------
          $sessionStorage.token = appSettings.config.token;
          $sessionStorage.user = appSettings.config.GetUserMenu.user;
          var UserId = _.get($localStorage.profile, "id")
          $rootScope.profile = $localStorage.profile;

          //  if ($sessionStorage.user && !(UserId || UserId == $sessionStorage.user)) {
          if (!UserId || (UserId && UserId != $sessionStorage.user)) {
            ApiGateway.get("public/profile", {
              id: $sessionStorage.user
            }).then(function (res) {
              $localStorage.profile = res.data;
              $localStorage.profile.id = $sessionStorage.user;
              $rootScope.profile = $localStorage.profile;
            })
          }
          $sessionStorage.userName = appSettings.config.GetUserMenu.userName;

          appSettings.config.Pin = appSettings.config.GetUserMenu.PinCode;

          if (appSettings.config.PIN_CODE_AUTHENTICATION_REQUIRED_CODE === appSettings.config.Pin) {
            $state.go('app.login');
          } else {
            
            PelApi.sessionStorage.ADAUTH =appSettings.config.GetUserMenu;
            appSettings.config.Pin = appSettings.config.GetUserMenu.PinCode;
            appSettings.config.IS_TOKEN_VALID = "Y";

            $sessionStorage.AuthInfo = {
              pinCode: appSettings.config.Pin,
              token: appSettings.config.token,
              user: appSettings.config.GetUserMenu.user,
              userName: appSettings.config.GetUserMenu.userName,
              timeStamp: new Date().getTime()
            };

            //Golan
            PelApi.pinState.set({
              valid: true,
              code: appSettings.config.Pin,
              apiCode: pinCodeStatus
            })
            //----- Rem by R.W. 02/01/2016 after conference with Lina and Maya
            //$scope.setSettings();
          }

        } else if ("PAD" === pinCodeStatus) {

          if (appSettings.config.PIN_CODE_AUTHENTICATION_REQUIRED_CODE === appSettings.config.Pin) {
            $state.go('app.login');
          }
        } else if ("PCR" === pinCodeStatus) {
          errorMsg = appSettings.PIN_STATUS.PAD;
          //PelApi.showPopup(appSettings.config.pinCodeSubTitlePCR , "");
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
        } else if ("PWA" === pinCodeStatus) {
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();
          //PelApi.showPopup(appSettings.config.pinCodeSubTitlePWA , "");
        } else if ("OLD" === pinCodeStatus) {
          PelApi.showPopupVersionUpdate(data.StatusDesc, "");
        } 
      }).error(
        function (errorStr, httpStatus, headers, config) {
          var time = config.responseTimestamp - config.requestTimestamp;
          var tr = ' (TS  : ' + (time / 1000) + ' seconds)';

          PelApi.throwError("api-400", "GetUserMenu", "httpStatus : " + httpStatus + tr, true)
          //PelApi.showPopup(appSettings.config.getUserModuleTypesErrorMag, "");
        }
      ).finally(function () {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    } //  GetUserMenuMain


    /** *****************************************************************
     *  When         Who      Description
     *  -----------  -------  -------------------------------------------
     *  02/08/2016   R.W.
     *****************************************************************
     */
    $scope.doRefresh = function () {
      $scope.showMenu =true;
      appSettings.config.MSISDN_VALUE = $sessionStorage.PELE4U_MSISDN || $localStorage.PELE4U_MSISDN;
      $scope.btn_class = {};
      $scope.btn_class.on_release = true;

      if (PelApi.deviceReady && !PelApi.cordovaNetwork.isOnline()) {
        var tryAgain = $ionicPopup.alert({
          title: 'בעיית חיבור נתונים',
          template: "<Div class='text-center'>" + appSettings.config.OFFLINE_MESSAGE + "</div>"
        });
        return false;
      }

      PelApi.showLoading();
      var errorMsg = "";

      $scope.isOnline = appSettings.config.isOnline;
      $scope.network = appSettings.config.network;

      //-------------------------------//
      //PelApi.setPELE4_SETTINGS_DIRECTORY();
      //-------------------------------//
      var continueFlag = "Y";


      if (PelApi.networkInfo.httpChannel() === "https://") {
        if (!appSettings.config.MSISDN_VALUE || appSettings.config.MSISDN_VALUE === undefined) {
          $state.go('app.ldap_login');
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        } else {
          if (appSettings.config.IS_TOKEN_VALID !== "Y") {
            $scope.GetUserMenuMain();
          } else {
            $sessionStorage.token = appSettings.config.token;
            $sessionStorage.user = appSettings.config.GetUserMenu.user;
            $sessionStorage.userName = appSettings.config.GetUserMenu.userName;
            $scope.feeds_categories = appSettings.config.GetUserMenu;

            $scope.visibleParent = "mid_0";
            $rootScope.menuItems = $sessionStorage.menuItems;
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
          }
        }
      } else {
        appSettings.config.IS_TOKEN_VALID = "Y"
        $scope.GetUserMenuMain();
      }
    }
    //------------------------------------------------------
    //--                  Switch APP
    //------------------------------------------------------
    $scope.appSwitch = function (i) {

      var iabOptions = {
        location: 'yes',
        clearcache: 'yes',
        toolbar: 'yes'
      };

      var target = i.target || "_blank";
      if (i.url) {
        $cordovaInAppBrowser.open(i.url, target, iabOptions)
          .then(function (event) {
            // success
          }, function (event) {
            // error
          });
        return false;
      } else if (i.Path) {
        var path = i.Path; //"apps/" + i.Path + "/app.html";
        //window.location.href = path;
        $state.go(path, {
          "AppId": i.AppId,
          "Title": i.Title,
          "Pin": i.Pin
        });
        //$state.go("app.p2_test");

      }
    };
    //-----------------------------------------------------------//
    //--                 forwardToApp
    //-----------------------------------------------------------//
    $scope.remenu = function (parent) {
      $scope.latestParent = $scope.childOf[parent];
      $scope.visibleParent = parent;
    }
    $scope.forwardToApp = function (appConfig) {
      if (!appConfig.Path) {
        $scope.latestParent = appConfig.parent;
        $scope.visibleParent = appConfig.menuId;
        return true;
      }

      $sessionStorage.PeleAppId = appConfig.AppId;

      srvShareData.addData({
        "PeleNetwork": appSettings.config.network,
        "PeleMsisdnValue": appSettings.config.MSISDN_VALUE,
        "PeleAppId": appConfig.AppId
      });

      var i = {};
      i.Path = appConfig.Path;
      i.AppId = appConfig.AppId;
      i.Title = appConfig.DisplayName;
      i.Pin = appSettings.config.Pin;

      PelApi.sessionStorage.ApiServiceAuthParams = {
        PIN: $sessionStorage.AuthInfo.pinCode,
        TOKEN: $sessionStorage.AuthInfo.token
      };
      if (appConfig.ApplicationType === "EXT") {
        window.open(appConfig.Path, '_system');
      } else {
        $scope.appSwitch(i);
      }
    };
    //-------------------------------//
    //--       Code Section        --//
    //-------------------------------//
    var btnClass = {};
    btnClass.activ = false;
    $scope.class = "pele-menu-item-on-touch item-icon-right";



    /** Golan  */
          
          
    if(PelApi.sessionStorage.newValidPinCode) { 
      appSettings.config.Pin =   PelApi.sessionStorage.newValidPinCode;
      _.set(PelApi.sessionStorage.ADAUTH,'PinCode',PelApi.sessionStorage.newValidPinCode);
     delete PelApi.sessionStorage.newValidPinCode;
    }

    var sessionAdauth = PelApi.sessionStorage.ADAUTH || {} ;
    var authMethod = BioAuth.getMethod();
    if(!authMethod) 
       return  $state.go('app.ldap_login');
       
       
    if(!sessionAdauth.token && authMethod == 'pincode') {
      return $scope.doRefresh(); 
    }

           
    if(!sessionAdauth.token && authMethod.match(/finger/)) 
      return  $state.go('app.ldap_login');
    
    var sessionMenuItems =  _.get(sessionAdauth,'menuItems',[]);

    if(sessionMenuItems.length) { 
      $scope.showMenu=true;
      $rootScope.menuItems  = $scope.sort(sessionMenuItems);
    }
    /**** Golan : Make GetUserMenu irrelvat when ADlogin return valid menu *****/

    $sessionStorage.token = sessionAdauth.token;
    $sessionStorage.user = sessionAdauth.user;
    var UserId = _.get($localStorage.profile, "id")
    $rootScope.profile = $localStorage.profile;
    appSettings.config.Pin = sessionAdauth.PinCode;
    $sessionStorage.userName = sessionAdauth.userName;
    $sessionStorage.AuthInfo = {
      pinCode: appSettings.config.Pin,
      token: appSettings.config.token,
      user: sessionAdauth.user,
      userName: sessionAdauth.userName,
      timeStamp: new Date().getTime()
    };

    if (!UserId || (UserId && UserId != $sessionStorage.user)) {
      ApiGateway.get("public/profile", {
        id: $sessionStorage.user
      }).then(function (res) {
        $localStorage.profile = res.data;
        $localStorage.profile.id = $sessionStorage.user;
        $rootScope.profile = $localStorage.profile;
      }).catch(function(err){
        PelApi.lagger.error("Failed to get public profile for user");
      })
    }

   /**************/
   var menuExists = _.get( $rootScope,'menuItems',null);
    if (!menuExists && authMethod == 'pincode')
        return $scope.doRefresh();     
 
  })
