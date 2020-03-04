/**
 * Created by User on 27/01/2016.
 */
var app = angular.module('pele.services', []);
app.service('StorageService', ['$http', 'PelApi', '$localStorage', function($http, PelApi, $localStorage) {
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
  this.set = function(varname, data, ttl) {
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
  this.get = function(varname) {
    return $localStorage[varname];
  };

  this.getData = function(varname, defaultValue) {
    defaultValue = defaultValue || null;
    var val = _.get($localStorage[varname], "data", defaultValue);
    if (checkExpired($localStorage[varname]))
      return defaultValue;
    return val;
  }
}]).service('ApiService', ['$http', '$ionicHistory', 'PelApi', '$sessionStorage', function($http, $ionicHistory, PelApi, $sessionStorage) {
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
  var isValidJson = function(str) {
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
    var authParamsString = PelApi.toQueryString($sessionStorage.ApiServiceAuthParams||{})

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


  this.checkResponse = function(data, httpStatus, config) {
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

  this.get = function() {
    return $http.get(urlBase);
  };

  this.post = function(ServiceName, AppId, requestParams) {

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
}]).service('ApiGateway', ['$http', '$ionicHistory', 'PelApi', '$sessionStorage', '$localStorage', '$cordovaNetwork', function($http, $ionicHistory, PelApi, $sessionStorage, $localStorage, $cordovaNetwork) {

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
    headers['x-appid'] = $sessionStorage.PeleAppId;
    headers['x-token'] = ApiServiceAuthParams.TOKEN;
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

  this.getSecureUrl = function(urlStr) {
    var secureUrl = getUrlBase() + urlStr;
    return secureUrl.replace("http://", "https://");
  }
  this.reauthOnForbidden = function(httpStatus, msg, config) {
    var errmsg = msg || "Auth failed - jump to entry page for reauth"
    if (httpStatus == 401 || httpStatus == 403) {
      PelApi.appSettings.config.IS_TOKEN_VALID = "N";
      PelApi.throwError("api", msg, "httpStatus : " + httpStatus + " (MS:" + config.ms + ")", false)
      PelApi.goHome();
    }
    return true;
  }

  this.throwError = function(httpStatus, from, config, redirect) {
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
  this.get = function(service, params, config) {
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
  this.post = function(service, params, config) {
    var url = getUrlBase() + service;
    config = config || {};
    var headerParams = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.post(url, params || {}, headerParams);
  };
  this.head = function(service, config) {
    var url = getUrlBase() + service;
    config = config || {};
    var headerParams = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.head(url, headerParams);
  };
  this.delete = function(service, params, config) {
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

  this.put = function(service, params, config) {
    var url = getUrlBase() + service;
    config = config || {};
    var headerParams = {
      retry: (config.retry || 2),
      timeout: (config.timeout || PelApi.appSettings.gw_timeout || 10000),
      headers: buildHeader(config.headers)
    }
    return $http.put(url, params || {}, headerParams);
  };
}]).service('srvShareData', function($window) {
  var KEY = 'App.SelectedValue';

  var addData = function(newObj) {
    var mydata = $window.sessionStorage.getItem(KEY);
    if (mydata) {
      mydata = JSON.parse(mydata);
    } else {
      mydata = [];
    }
    mydata.push(newObj);
    $window.sessionStorage.setItem(KEY, JSON.stringify(mydata));
  };

  var getData = function() {
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
