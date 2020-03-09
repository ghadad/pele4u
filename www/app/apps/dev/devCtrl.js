angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('devCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$fileLogger',
    function($scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $fileLogger) {

      $scope.title = "בדיקת צרופות";
      $scope.openAttachment = function(file) {
        PelApi.openAttachment(file)
      }
      $scope.errors = PelApi.getErrorsStack();


      $fileLogger.getLogfile().then(function(log) {
        $scope.logContent = log
      });

      $scope.attachments = [{
        "DISPLAY": "Y",
        "DISPLAY_NAME": "<span class='alert' style='color:red'>notexists.notexists</span>",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "notexists.notexists",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "notexists.notexists"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "rtf.rtf",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "rtf.rtf",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "rtf.rtf"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "docx.docx",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "docx.docx",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "docx.docx"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "csv.csv",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "csv.csv",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "csv.csv"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "xls.xls",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "xls.xls",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "xls.xls"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "doc.doc",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "doc.doc",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "doc.doc"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "gif.gif",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "gif.gif",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "gif.gif"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "png.png",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "png.png",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "png.png"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "txt.txt",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "txt.txt",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "txt.txt"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "pdf.pdf",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "pdf.pdf",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "pdf.pdf"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "tif.tif",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "tif.tif",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "tif.tif"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "msg.msg",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "msg",
        "TARGET_FILENAME": "msg.msg",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "msg.msg"
      }, {
        "DISPLAY": "Y",
        "DISPLAY_NAME": "doc.doc",
        "TARGET_PATH": "DV/TASK/TEST",
        "EXT": "rtf",
        "TARGET_FILENAME": "doc.doc",
        "SHOW_CONTENT": "Y",
        "IOS_TARGET_FILENAME": "doc.doc"
      }]

    }
  ]);