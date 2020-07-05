/*
Created by User on 27/05/2020.
*/
angular.module('pele')
  .controller('payListCtrl', function($scope, $stateParams, $http, $q, $ionicLoading, $state, PelApi, appSettings) {
    $scope.activeGroup = PelApi.sessionStorage.activeAccordionGroup;

    $scope.parse = function(data) {
      var mapped = [];
      if (data.length == 1) {
        $scope.activeGroup = data[0].DOC_NAME;
      }
      data.forEach(function(item) {
        var docsGroups = _.get(item, "DOCUMENTS.DOCUMENTS_ROW", [])
        docsGroups.forEach(function(g) {
          var pays;
          try {
            pays = JSON.parse(_.get(g, "MESSAGE", "{}"));
          } catch (e) {
            pays = {}
            PelApi.lagger.error("Failed to parse  JSON  string on docsGroup ")
          }
          g.PAYS = _.get(pays, "ROW.ROW", {});
        })
        mapped.push(item)
      });
      return mapped;
    }

    //----------------------- REFRESH ------------------------//
    $scope.doRefresh = function() {

      PelApi.showLoading();
      $scope.appId = $stateParams.AppId;
      $scope.formType = $stateParams.FormType;
      $state.pin = $stateParams.Pin;
      var links = PelApi.getDocApproveServiceUrl("GtUserFormGroups");

      var retGetUserFormGroups = PelApi.GetUserFormGroups(links, $scope.appId, $scope.formType, $state.pin);
      var srvData = {};

      retGetUserFormGroups.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);
          var result = apiData.ROW || [];
          //Cursor if empty
          if (result.length && result[0].DOC_NAME === null) {
            PelApi.goHome();
          }


          $scope.docsGroups = $scope.parse(result);
          if ($scope.docsGroups.length) {
            $scope.title = $scope.docsGroups[0].DOC_TYPE;
          }

        })
        .error(function(error, httpStatus) {
          PelApi.throwError("api", "GetUserNotifNew", "httpStatus : " + httpStatus)
        })
        .finally(function(skip) {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.forwardToDoc = function(docId, docInitId, notificationId) {

      var statePath = 'app.pay_details';

      $state.go(statePath, {
        formType: $scope.formType,
        AppId: $scope.appId,
        docId: docId,
        docInitId: notificationId
      });
    }

    $scope.feed = [];
    $scope.searchText = "";
    $scope.doRefresh();

  });