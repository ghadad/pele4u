var FingerPrint = function () {};

// method to check is the touch id option is available in the device
FingerPrint.prototype.isAvailable = function (successCallback, errorCallback) {
    if(!window.cordova)
    return errorCallback("Cordova not installed ");
  // success callback function for android 
  var successCbFingerPrintAuth = function(result) {
    if(result && !result.isAvailable){
      var message;
      // if not support touch id
      if(!result.isHardwareDetected){
        message = "This device didn't support Touch ID";
      }
      // if not have any finger print enrolled in the device
      else if(!result.hasEnrolledFingerprints){
        message = "No fingers are enrolled with Touch ID";
      }
      errorCallback(message);
    }
    else{
      successCallback(result);
    }
    
  };

  // error callback function for android 
  var errorCbFingerPrintAuth = function(error) {
    var message;
    if(error && !error.isAvailable){
      // if not support touch id
      if(!error.isHardwareDetected){
        message = "This device didn't support Touch ID";
      }
      // if not have any finger print enrolled in the device
      else if(!error.hasEnrolledFingerprints){
        message = "No fingers are enrolled with Touch ID";
      }
    }
    errorCallback(message);
  };
  // if the device is android call the FingerprintAuth plugin
  if(cordova.platformId === "android")FingerprintAuth.isAvailable(successCbFingerPrintAuth, errorCbFingerPrintAuth);
  // if the device is ios call the touchid plugin 
  if(cordova.platformId === "ios")touchid.checkSupport(successCallback, errorCallback);
};

// method to authenticate with touch id 
FingerPrint.prototype.authenticate = function (successCallback, errorCallback,object) {

    // if the device is android call the FingerprintAuth plugin
    if(cordova.platformId === "android"){FingerprintAuth.encrypt(object, successCallback, errorCallback);}
    // if the device is ios call the touchid plugin 
    if(cordova.platformId === "ios")touchid.authenticate(successCallback, errorCallback, object.dialogMessage);
};

FingerPrint.prototype.decrypt =   function (successCallback, errorCallback,object) {
     // if the device is android call the FingerprintAuth plugin
    if(cordova.platformId === "android"){FingerprintAuth.decrypt(object, successCallback, errorCallback);}
    // if the device is ios call the touchid plugin 
    if(cordova.platformId === "ios")touchid.authenticate(successCallback, errorCallback, object.dialogMessage);
};


FingerPrint.prototype.checkBiometry = function(successCallback, errorCallback) {
    // success callback function for android 
    var successCbFingerPrintAuth = function(result) {successCallback(1)};
    // error callback function for android 
    var errorCbFingerPrintAuth = function(error) {
			errorCallback(-1);
    };
  
    // if the device is android call the FingerprintAuth plugin
    if(cordova.platformId === "android"){FingerprintAuth.isAvailable(successCbFingerPrintAuth, errorCbFingerPrintAuth);}
    // if the device is ios call the touchid plugin 
    if(cordova.platformId === "ios")touchid.checkBiometry(successCallback, errorCallback);
}

window.BiometricAuth  = new FingerPrint();
