angular.module('pele')
  .controller('chatPoDetailsCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaFileTransfer','$state',
    function($scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaFileTransfer, $state) {
    
 
        PelApi.deleteAttachDirecoty();
 
        $scope.docDetails = $stateParams.obj;
        $scope.attachedDocuments = $scope.docDetails.ATTACHED_DOCUMENTS || [];
        $scope.explainPerson = $scope.docDetails.EXPLAIN_PERSON || [];
        $scope.matchPrice = $scope.docDetails.MATCH_PRICE || [];
        PelApi.extendActionHistory($scope.docDetails);

        $scope.tabs = [{
          "text": "סבב מאשרים"
        }, {
          "text": "תוכן הזמנה" 
        }];  
        
        $scope.title = "הזמנת רכש " + $scope.docDetails.PO_ORDER_NUMBER;
        
        $scope.onSlideMove = function(data) {
          //alert("You have selected " + data.index + " tab");
        };

        $scope.toggleActionItem = function(action) {
          action.display = !action.display;
          if (action.display) 
            action.left_icon = 'ion-chevron-down';
          else action.left_icon = 'ion-chevron-left';
        };

        $scope.openAttachment = function(file) {
          PelApi.openAttachment(file, $scope.appId);
        };
      }

  ]);