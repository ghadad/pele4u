var BiometricAuth = function () {};

// method to check is the touch id option is available in the device
BiometricAuth.prototype.isAvailable = function (successCallback, errorCallback) {
  if (!window.cordova)
    return errorCallback("Cordova not installed ");
  

  var successCbFingerPrintAuth = function (result) {
    if (result && !result.isAvailable) {
      var message;
          if (!result.isHardwareDetected) {
        message = "This device didn't support Touch ID";
      }
    
      else if (!result.hasEnrolledFingerprints) {
        message = "No fingers are enrolled with Touch ID";
      }
      errorCallback(message);
    } else {
      successCallback(result);
    }

  };
  
  var errorCbFingerPrintAuth = function (error) {
    var message;
    if (error && !error.isAvailable) {
  
      if (!error.isHardwareDetected) {
        message = "This device didn't support Touch ID";
      }
  
      else if (!error.hasEnrolledFingerprints) {
        message = "No fingers are enrolled with Touch ID";
      }
    }
    errorCallback(message);
  };


  
  if (cordova.platformId === "android") FingerprintAuth.isAvailable(successCbFingerPrintAuth, errorCbFingerPrintAuth);
  if (cordova.platformId === "ios") Fingerprint.isAvailable(successCallback, errorCallback);
};


BiometricAuth.prototype.authenticate = function (successCallback, errorCallback, object) {
  if (cordova.platformId === "android") {
    FingerprintAuth.encrypt(object, successCallback, errorCallback);
  }

  if (cordova.platformId === "ios") { 
    Fingerprint.show(object,successCallback, errorCallback);
  }
};

BiometricAuth.prototype.decrypt = function (successCallback, errorCallback, object) {
  if (cordova.platformId === "android") {
    FingerprintAuth.decrypt(object, successCallback, errorCallback);
  }
  if (cordova.platformId === "ios") { 
    Fingerprint.show(object,successCallback, errorCallback);
  }
};


window.BiometricAuth = new BiometricAuth();