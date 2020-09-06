/**
 * Created by User on 27/01/2016.
 */
var app = angular.module('pele.services', []);

app.service('StorageService', ['$http', 'PelApi', '$localStorage', function ($http, PelApi, $localStorage) {
  // ttl - time ( seconds to live)

  var yearTtl = 60 * 60 * 24 * 365 * 1000;

  function currentStamp() {
    return new Date().getTime();
  }

  function checkExpired(obj) {
    if (!obj) obj = {};
    if (!obj.ttl) obj.ttl = yearTtl;
    var current = new Date().getTime();
    if (currentStamp() - obj.timestamp > obj.ttl)
      return true;
    return false;
  }
  this.set = function (varname, data, ttl) {
    // default ttl is one year
    if (typeof ttl === 'undefined')
      ttl = yearTtl;
    if (typeof $localStorage[varname] === 'undefined' || $localStorage[varname] === null || checkExpired($localStorage[varname])) {
      $localStorage[varname] = {};
      $localStorage[varname].data = data;
      $localStorage[varname].ttl = ttl;
      $localStorage[varname].timestamp = currentStamp();
    }
    return $localStorage[varname];
  }
  this.get = function (varname) {
    return $localStorage[varname];
  };

  this.getData = function (varname, defaultValue) {
    defaultValue = defaultValue || null;
    var val = _.get($localStorage[varname], "data", defaultValue);
    if (checkExpired($localStorage[varname]))
      return defaultValue;
    return val;
  }
}]).service('ApiService', ['$http', '$ionicHistory', 'PelApi', '$sessionStorage', function ($http, $ionicHistory, PelApi, $sessionStorage) {
  var Errors = {
    2: {
      description: "token invalid",
      redirectToMenu: true
    },
    3: {
      description: "error in sso / pin code",
      redirectToMenu: true
    }
  }
  var env = PelApi.appSettings.env;
  var isValidJson = function (str) {
    try {
      JSON.stringify(str)
    } catch (err) {
      return false
    }
    return true
  }

  function buildServiceCaller(ServiceName, config) {
    var internal = {};
    var internalConfig = config;
    internal.timeout = internalConfig.timeout = internalConfig.timeout || PelApi.appSettings.api_timeout;
    internalConfig.params = internalConfig.params || {};

    var urlBase = PelApi.networkInfo.httpChannel() + PelApi.appSettings.apiConfig.hostname;
    var ServiceUrl = urlBase + '/' + PelApi.appSettings.SSOEnv[env] + '/CallMobileService';
    var authParams = $sessionStorage.ApiServiceAuthParams || {};
    authParams.APPID = internalConfig.AppId;
    var authParamsString = PelApi.toQueryString($sessionStorage.ApiServiceAuthParams || {})

    internal.url = ServiceUrl + '?' + authParamsString;
    var EnvCode = "MobileApp_" + PelApi.appSettings.EnvCodes[env];

    var request = {
      "Request": {
        "RequestHeader": {
          "ServiceName": ServiceName,
          "AppID": "MobileApp",
          "EnvCode": EnvCode,
          "Timeout": internalConfig.timeout
        },
        "InParams": {
          "PEL_PARAMETERS": {
            "LINE_NUMBER": "1",
            "P1": internalConfig.params.p1 || null,
            "P2": internalConfig.params.p2 || null,
            "P3": internalConfig.params.p3 || null,
            "P4": internalConfig.params.p4 || null,
            "P5": internalConfig.params.p5 || null,
            "P6": internalConfig.params.p6 || null,
            "P7": internalConfig.params.p7 || null,
            "P8": internalConfig.params.p8 || null,
            "P9": internalConfig.params.p9 || null,
            "P10": internalConfig.params.p10 || null,
            "P11": internalConfig.params.p11 || null,
            "P12": internalConfig.params.p12 || null,
            "P13": internalConfig.params.p13 || null,
            "P14": internalConfig.params.p14 || null,
            "P15": internalConfig.params.p15 || null
          }
        }

      }
    };

    internal.bodyRequest = request;
    return internal;
  }


  this.checkResponse = function (data, httpStatus, config) {
    var errorMsg = "InvalidJsonResponse";
    var sys = ""
    if (isValidJson(data) == false || !data) {
      errorMsg = "InvalidJsonResponse";
      if (typeof data === "string") {
        errorMsg = data;
      }
      return PelApi.throwError("api", "ApiService.checkResponse-InvalidJsonResponse", "(httpStatus : " + httpStatus + ") " + errorMsg + "(ms:" + config.ms + ")")
    }
    if (data.Error && data.Error.errorCode) {
      errorMsg = "Application Error";
      sys = "api";
      var err = Errors[data.Error.errorCode] || {};
      if (err.redirectToMenu) {
        $ionicHistory.clearHistory();
        return PelApi.goHome();
      }
      return PelApi.throwError("api", "ApiService.checkResponse-" + errorMsg, "(httpStatus : " + httpStatus + ") " + JSON.stringify(data) + "(ms:" + config.ms + ")", false)
    }
    if (httpStatus != 200) {
      errorMsg = "http resource error";
      return PelApi.throwError("api", "ApiService.checkResponse-" + errorMsg, "(httpStatus : " + httpStatus + ")" + "(ms:" + config.ms + ")")
    }
    return data;
  }

  this.get = function () {
    return $http.get(urlBase);
  };

  this.post = function (ServiceName, AppId, requestParams) {

    var apiConfig = buildServiceCaller(ServiceName, {
      AppId: AppId,
      params: requestParams || {}
    })

    return $http.post(apiConfig.url, apiConfig.bodyRequest, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json ; charset=utf-8'
      }
    });
  };
}]).service('ApiGateway', ['$http', '$ionicHistory', 'PelApi', '$sessionStorage', '$localStorage', '$cordovaNetwork', function ($http, $ionicHistory, PelApi, $sessionStorage, $localStorage, $cordovaNetwork) {

  function getUrlBase() {
    var env = _.get(PelApi.appSettings.EnvCodes, PelApi.appSettings.env).toLowerCase()
    var urlBase = PelApi.networkInfo.channels.secure + PelApi.appSettings.apiConfig.hostname;
    var urlBase = urlBase + '/mobileAppGw/' + env + '/';
    return urlBase;
  }

  function buildHeader(params) {
    var headers = params || {};
    //headers['withCredentials'] = 'true';
    var ApiServiceAuthParams = _.get($sessionStorage, "ApiServiceAuthParams", {});
    headers['x-appid'] = $sessionStorage.PeleAppId || "xyz";
    headers['x-token'] = ApiServiceAuthParams.TOKEN || $sessionStorage.token;
    headers['x-pincode'] = ApiServiceAuthParams.PIN;
    headers['x-username'] = $sessionStorage.userName;
    headers['x-msisdn'] = ($sessionStorage.PELE4U_MSISDN || PelApi.appSettings.config.MSISDN_VALUE) || $localStorage.PELE4U_MSISDN;
    return headers;
  }


  function getUrl(urlStr) {
    return getUrlBase() + urlStr;
  }


  //return PelApi.throwError("api", "ApiService.checkResponse-InvalidJsonResponse", "(httpStatus : " + httpStatus + ") " + errorMsg)
  //return PelApi.throwError("api", "ApiService.checkResponse-" + errorMsg, "(httpStatus : " + httpStatus + ") " + JSON.stringify(data), false)
  this.getHeaders = buildHeader;
  this.getUrl = getUrl;

  this.getSecureUrl = function (urlStr) {
    var secureUrl = getUrlBase() + urlStr;
    return secureUrl.replace("http://", "https://");
  }
  this.reauthOnForbidden = function (httpStatus, msg, config) {
    var errmsg = msg || "Auth failed - jump to entry page for reauth"
    if (httpStatus == 401 || httpStatus == 403) {
      PelApi.appSettings.config.IS_TOKEN_VALID = "N";
      PelApi.throwError("api", msg, "httpStatus : " + httpStatus + " (MS:" + config.ms + ")", false)
      PelApi.goHome();
    }
    return true;
  }

  this.throwError = function (httpStatus, from, config, redirect) {
    var msstr = " (MS:" + config.ms + ")";
    if (httpStatus == 401 || httpStatus == 403) {
      PelApi.appSettings.config.IS_TOKEN_VALID = "N";
      PelApi.throwError("api-gateway", "Auth failed - goto to UserMenu  for reauth", "httpStatus : " + httpStatus + msstr, false)
      PelApi.goHome();
    } else {
      var errorString = "httpStatus :" + httpStatus + msstr;
      PelApi.throwError("api-gateway", from, errorString, redirect);
    }

  }
  this.get = function (service, params, config) {
    var url = getUrlBase() + service;
    params = params || {};
    config = config || {};
    var httpConfig = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      params: params,
      headers: buildHeader(config.headers)
    }

    return $http.get(url, httpConfig);
  };
  this.getToken = function (params, config) {

    var url = getUrl("users/token")
    params = params || {};
    config = config || {};
    var httpConfig = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      params: params,
      headers: buildHeader(config.headers)
    }
    return $http.get(url, httpConfig);
  };

  this.getTokenUrl = function (path) {
    return this.getUrl(path) + $sessionStorage.gwTokensQuery
  }

  this.setSessionTokens = function () {
    return this.getToken().success(function (r) {
      var jwtToken = _.get(r, 'token', "");
      var userId = PelApi.appSettings.config.user || $sessionStorage.user;
      if (jwtToken.length > 100) {
        $sessionStorage.gwTokensQuery = '?jwtToken=' + jwtToken + '&token=' + $sessionStorage.token + '&userId=' + userId;
      }
    }).error(function (error, httpStatus, headers, config) {
      $sessionStorage.jwtToken = "";
    })
  }

  this.openInApp = function (url) {
     if(!window.cordova) {
       swal({ text: 'האפליקציה מנסה להפעיל תכונה שמתאימה להפעלה בסמארטפון בלבד',});
       return false;
    }
    var swalObject = {
      type: 'error',
      title: 'תהליך אימות העובד נכשל',
      text: 'נא צאו והתחברו שוב ונסו שנית ',
      showConfirmButton: false,
      timer: 2500
    };
    PelApi.showLoading();

    this.getToken().success(function (r) {
      var jwtToken = _.get(r, 'token', "");
      var userId = PelApi.appSettings.config.user || $sessionStorage.user;
      if (jwtToken.length < 100) {
        PelApi.hideLoading();
        swal(swalObject)
      } else {
        var extAuth = {
          token: $sessionStorage.token,
          userId: PelApi.appSettings.config.user || $sessionStorage.user,
          jwtToken: jwtToken,
          backDoor: window.document.location
        }
        var qstr = "";

        for (var key in extAuth) {
          if (qstr != "") {
            qstr += "&";
          }
          qstr += key + "=" + encodeURIComponent(extAuth[key]);
        }

        var fullUrl = url + '?' + qstr

        var iabOptions = 'toolbar=no,presentationstyle=fullscreen,location=no,zoom=no,footer=no,closebuttoncaption=סגור'; 
       
        var inAppBrowserRef = cordova.InAppBrowser.open(fullUrl, '_blank', iabOptions);
         
         inAppBrowserRef.addEventListener('loaderror', function () {
          PelApi.hideLoading();
          swal(swalObject);
        });

        inAppBrowserRef.addEventListener("loadstop", function () {
          var loop = window.setInterval(function () {
            inAppBrowserRef.executeScript({
                code: "window.backToPele4u"
              },
              function (values) {
                if (values[0]) {
                  inAppBrowserRef.close();
                  window.clearInterval(loop);
                }
              });
          }, 200);
        });
      }
    }).error(function (error, httpStatus, headers, config) {
      PelApi.hideLoading();
      swal(swalObject)

    }).finally(function () {

    });
  }


  this.openPortal = function (url,cred) {
    //disable it until next production
    // return false ;
 
    PelApi.store.set("portalLogin","progress");

    if(!window.cordova) {
       swal({ text: 'האפליקציה מנסה להפעיל תכונה שמתאימה להפעלה בסמארטפון בלבד',});
       return false;
    }


    PelApi.showLoading({
      duration: 1000 * 3
    });
    var iabOptions =  "clearcache=yes,clearsessioncache=yes,location=no,hidden=yes";
    iabOptions =  "clearcache=no,clearsessioncache=no,location=no,hidden=yes";
    if(!cred)
     iabOptions =  'clearcache=no,clearsessioncache=no,location=no,hidden=yes,zoom=no,footer=no'; 

     var inAppBrowserRef =  cordova.InAppBrowser.open(encodeURI(url), '_blank',iabOptions);
       inAppBrowserRef.addEventListener("loaderror", function () {
          PelApi.hideLoading();
     });
      
    
     if(!cred) {
      var noCredCode =  "(function getPele$uState() { \
                          if(window.backToPele4u) \
                            return 'close-pele4u' ; \
                          if(document.getElementById('pele4u-logout')) \
                            return 'login-success' ; \
                          if(document.getElementById('Log_On')) \
                            return 'login-error' ; \
                          })();"
 
       var loop = setInterval(function() {
       inAppBrowserRef.executeScript({ code: noCredCode  },
       function( values ) {
           var res = values[ 0 ];
             if ( res ) {
               if(res == "close-pele4u" && res == "login-error") {
                clearInterval( loop );
                inAppBrowserRef.close();
               }
               PelApi.store.set("portalLogin",res);
           }
       })},200);


      setTimeout(function(){
        inAppBrowserRef.show();
      },300) 
     }
     else {
      var  loginCode = "function tryLoginPortal(pele4uIdxParam) { \
                      setTimeout(function() { \
                        var btn = document.getElementById('Log_On') ;\
                        if(btn && pele4UbtnFired == 0 ) { \
                         alert('pele4UbtnFired = '+pele4UbtnFired+ ' pele4uIdxParam = ' + pele4uIdxParam ) ;\
                         document.getElementById('login').value = '__username' ; \
                         document.getElementById('passwd').value = '__password' ; \
                         pele4UbtnFired = true ; \
                         btn.click(); \
                        } \
                       },300 * pele4uIdxParam) \
                    } ; \
                   var pele4UbtnFired = false; var pele4uIdx ;\
                   for(pele4uIdx=1; pele4uIdx<=10;pele4uIdx++) { \
                     tryLoginPortal(pele4uIdx); \
                    } ";

     var testLoginCode = "(function(){ \
                     if(document.getElementById('pele4u-logout')) \
                        return 'login-success'; \
                     if(document.getElementById('errorMessageLabel')) \
                        return 'login-error'; \
                      return 'login-progress'  ; \
                    })()";
            
         
     loginCode = loginCode.replace(/__username/g, cred.UserName );
     loginCode = loginCode.replace(/__password/g, cred.password );
         
      inAppBrowserRef.addEventListener("loadstop", function () {
        PelApi.hideLoading();
          inAppBrowserRef.executeScript({code: loginCode});
          var ts1 =  new Date().getTime();
          var loop = setInterval(function(){
            inAppBrowserRef.executeScript({code: testLoginCode},
              function( values ) {
                var res = values[ 0 ];
                if ( res ) {
                  if(res == "login-error" || (new Date().getTime() - ts1)  > 20*1000) {
                    PelApi.store.set("portalLogin","login-error");
                    clearInterval( loop );
                   inAppBrowserRef.close();
                  } else { 
                    PelApi.store.set("portalLogin",res);
                  }                   
              }
             })
          },200);

     });
    }
  }

  this.openBrowser = function (url) {
    //return   cordova.plugins.browsertab.openUrl(encodeURI(url));
     var swalObject = {
      type: 'error',
      title: 'לא מצליח לפתוח את היישום',
      text: 'תהליך אימות העובד נכשל ',
      showConfirmButton: false,
      timer: 2500
    };
      PelApi.showLoading({
      duration: 1000 * 3
    });

    this.getToken().success(function (r) {
      var jwtToken = _.get(r, 'token', "");
      var userId = PelApi.appSettings.config.user || $sessionStorage.user;
      if (jwtToken.length < 100) {
        swal(swalObject)
      } else {
        window.open(url + '?jwtToken=' + jwtToken + '&token=' + $sessionStorage.token + '&userId=' + userId, '_system');
      }
    }).error(function (error, httpStatus, headers, config) {
      swal(swalObject)
    }).finally(function () {
      PelApi.hideLoading();
    });
  }

  this.post = function (service, params, config) {
    var url = getUrlBase() + service;
    config = config || {};
    var headerParams = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.post(url, params || {}, headerParams);
  };
  this.head = function (service, config) {
    var url = getUrlBase() + service;
    config = config || {};
    var headerParams = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.head(url, headerParams);
  };
  this.delete = function (service, params, config) {
    var url = getUrlBase() + service;
    params = params || {};
    config = config || {};
    var headerParams = {
      params: params,
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.delete(url, headerParams);
  };

  this.put = function (service, params, config) {
    var url = getUrlBase() + service;
    config = config || {};
    var headerParams = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.put(url, params || {}, headerParams);
  };
}]).service('srvShareData', function ($window) {
  var KEY = 'App.SelectedValue';

  var addData = function (newObj) {
    var mydata = $window.sessionStorage.getItem(KEY);
    if (mydata) {
      mydata = JSON.parse(mydata);
    } else {
      mydata = [];
    }
    mydata.push(newObj);
    $window.sessionStorage.setItem(KEY, JSON.stringify(mydata));
  };

  var getData = function () {
    var mydata = $window.sessionStorage.getItem(KEY);
    if (mydata) {
      mydata = JSON.parse(mydata);
    }
    return mydata || [];
  };

  return {
    addData: addData,
    getData: getData
  };
});
