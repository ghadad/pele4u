/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('travelDetailsCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup',
    function($scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup) {
      $scope.actionNote = {};
      $scope.params = $stateParams;
      //    $scope.tabs = appSettings.tabs;
      $scope.tabs = [{
        "text": "סבב מאשרים"
      }, {
        "text": "תוכן טופס"
      }];

      $scope.appId = $stateParams.AppId;
      $scope.notifLinks = PelApi.getDocApproveServiceUrl("SubmitNotif");

      $scope.getData = function() {

        PelApi.showLoading({
          noBackdrop: true
        });

        PelApi.deleteAttachDirecoty();

        var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");
        var retGetUserNotifications = PelApi.GetUserNotifications(links, $scope.appId, $stateParams.docId, $stateParams.docInitId);
        retGetUserNotifications.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);
          if (apiData.error) return false;
          $scope.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true);
          $scope.title = "נסיעות לחול";
          $scope.docDetails.attachments = $scope.docDetails.ATTACHMENT_FILES || [];
          PelApi.extendActionHistory($scope.docDetails);
          $scope.buttonsArr = $scope.docDetails.BUTTONS || [];
          //PelApi.lagger.info("scope.docDetails", JSON.stringify($scope.docDetails))
        }).error(function(error, httpStatus, headers, config) {
          var time = config.responseTimestamp - config.requestTimestamp;
          var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
          PelApi.throwError("api", "GetUserNotifNew", "httpStatus : " + httpStatus + tr)
        }).finally(function() {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.createNote = function(u) {
        $scope.Note = u.Note;
        $scope.modal.hide();
      };

      $scope.openAttachment = function(file) {
        PelApi.openAttachment(file, $scope.appId);
      }

      $scope.toggleActionItem = function(action) {
        action.display = !action.display;
        if (action.display) action.left_icon = 'ion-chevron-down';
        else action.left_icon = 'ion-chevron-left';
      }

      $scope.onSlideMove = function(data) {
        
      };

      $scope.updateDoc = function(btn) {
        if (btn.note) {
          PelApi.displayNotePopup($scope, btn)
        } else {
          $scope.submitUpdateInfo(btn, $scope.actionNote.text);
        }
      };

      $scope.submitUpdateInfo = function(btn, note) {
        PelApi.showLoading();
        PelApi.SubmitNotification($scope.notifLinks, $scope.appId, $scope.docDetails.NOTIFICATION_ID, note, btn.action)
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

      $scope.displayNotePopup = function() {
        PelApi.displayNotePopup($scope);
      }

      $scope.showBtnActions = function() {
        PelApi.showBtnActions($scope, $scope.buttonsArr);
      }

      $scope.getData();

    }
  ]);
