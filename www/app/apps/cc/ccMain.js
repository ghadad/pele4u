angular.module('pele')
  .controller('ccMainCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicModal', 'PelApi', '$ionicScrollDelegate', '$sce', '$ionicHistory',
  function(StorageService, ApiGateway, $scope, $state, $ionicModal, PelApi, $ionicScrollDelegate, $sce, $ionicHistory) {
      $scope.title = "CC - Main";
      PelApi.showLoading();
      ApiGateway.get("cc/getenv", {
      }).success(function(data) {
        $scope.envList = data.EnvList;
        $scope.envList = _.filter($scope.envList, (e) => e.Environment != null);
      }).error(function(error, httpStatus, headers, config) {
        //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized getnext api", config);
        //PelApi.throwError("api", "get new Lead seq", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
        ApiGateway.throwError(httpStatus, "CC get Environments List", config);
      }).finally(function() {
        PelApi.hideLoading();
      });
    }
  ]);
