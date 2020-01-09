/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('chatDetailsCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaFileTransfer','$state',
    function($scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaFileTransfer, $state) {

      $scope.actionNote = {};
      $scope.appId = $stateParams.AppId;
      $scope.notifLinks = PelApi.getDocApproveServiceUrl("SubmitNotif");

      $scope.getData = function() {

        PelApi.showLoading({
          noBackdrop: true
        });

        var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");
        var retGetUserNotifications = PelApi.GetUserNotifications(links, $scope.appId, $stateParams.docId, $stateParams.docInitId);
          
          retGetUserNotifications.success(function(data) {
          var apiData = PelApi.checkApiResponse(data); 

          if (apiData.error) return false;
          
          $scope.title = "ביאור";
          $scope.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true); 
          $scope.chat = $scope.docDetails.NOTE[0] || [];
          $scope.buttonsArr = $scope.docDetails.BUTTONS || [];
        }).error(function(error, httpStatus, headers, config) {
          var time = config.responseTimestamp - config.requestTimestamp;
          var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
          PelApi.throwError("api", "GetUserNotifNew", "httpStatus : " + httpStatus + tr)
        }).finally(function() {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
      };      

      $scope.updateDoc = function(btn) {
        if (btn.note) {
          PelApi.displayNotePopupChat($scope, btn)
        } else {
          $scope.submitUpdateInfo(btn, $scope.actionNote.text);
        }
      };

      $scope.submitUpdateInfo = function(btn, note) {
        PelApi.showLoading();
        PelApi.SubmitNotification($scope.notifLinks, $scope.appId, $scope.docDetails.CHAT_NOTIFICATION_ID, note, btn.action)
          .success(function(data) {
            var apiData = PelApi.checkApiResponse(data);
            if (apiData.error) return false;
            $ionicHistory.goBack(); 
          }).error(
            function(error, httpStatus, headers, config) {
              var time = config.responseTimestamp - config.requestTimestamp;
              var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
              PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus + tr)
            }).finally(function() {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
          });
      };
 
      $scope.displayNotePopupChat = function() {
        PelApi.displayNotePopupChat($scope);
      }
      
      $scope.showBtnActions = function() {
        PelApi.showBtnActions($scope, $scope.buttonsArr);
      };

      $scope.showAnswear = function (answearField) {
        retturn (answearField === undefined || answearField == null || answearField.length <= 0 ? false : true);
      }

      $scope.goToOrder = function () {
        $state.go('app.chat_po_details', {obj: $scope.docDetails});
      }

      $scope.getData();
    }
  ]);
