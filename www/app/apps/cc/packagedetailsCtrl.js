angular.module('pele')
  .controller('packagedetailsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicModal', 'PelApi', '$ionicScrollDelegate', '$sce', '$ionicHistory',
  function(StorageService, ApiGateway, $scope, $state, $ionicModal, PelApi, $ionicScrollDelegate, $sce, $ionicHistory) {
      $scope.title = "CC - Package details";
      $scope.package = $state.params.pkg;
      $scope.state = $state.params.stat;

      function callEAILauncher(eaipath) {
        PelApi.showLoading();
        ApiGateway.post(eaipath, {
            environment:$state.params.env,
            state:$state.params.stat,
            package:$state.params.pkg,
        }).success(function(data) {
        
        //let retpath='#/app/ccApp/packagelist/' + state.params.env + "/" + new Date().getTime();
        //window.location.href = retpath;
          
          $state.go("app.cc.packagelist", {
              env: $state.params.env,
	      timestamp: new Date().getTime()
            }, {
              reload: true
          })
          /*
         $state.transitionTo("app.cc.main", {env: $state.params.env}, {
           reload: true,
           inherit: false,
           notify:true
         })
         */
        }).error(function(error, httpStatus, headers, config) {
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized getnext api", config);
          //PelApi.throwError("api", "get new Lead seq", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, eaipath, config);
        }).finally(function() {
          PelApi.hideLoading();
        });
      }

      $scope.promote = function() {
        callEAILauncher("cc/promotepackage");
      }

      $scope.demote = function() {
        callEAILauncher("cc/demotepackage");
    }
  }]);
