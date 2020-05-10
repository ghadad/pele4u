/**
 * Created by User on 25/08/2016.
 */
/*
async function getPackages($http, p, e) {
  try{
    let responce = await $http({
      method: 'GET',
      url: 'BackEndURIfromConf' //!!!!!!!!!!!!!!!!! CONF
    });
    p = responce.data ;
  } catch (error) {
    e = error;
  }
}*/

angular.module('pele')
  .controller('packageListCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicModal', 'PelApi', '$ionicScrollDelegate', '$sce', '$ionicHistory',
  function(StorageService, ApiGateway, $scope, $state, $ionicModal, PelApi, $ionicScrollDelegate, $sce, $ionicHistory) {
      $scope.title = $state.params.env;
      $scope.envir = $state.params.env;
      $scope.states = [
        {state: "Development",visible: false},
        {state: "Reviewer approval",visible: false},
        {state: "Qa",visible: false},
        {state: "Build",visible: false},
        {state: "Build Approval",visible: false},
        {state: "Build Review",visible: false},
        {state: "Completed",visible: false},
        {state: "Ready prod",visible: false}, 
        {state: "Production",visible: false}];
      PelApi.showLoading();
      $scope.states.forEach(state => {
        ApiGateway.get("cc/getpackage", {
            environment: $state.params.env,
            state: state.state
          }).success(function(pdata) {
            packages = _.filter(pdata.PackageList, (e) => (e) && (e.Package != null));
            state.packages = packages;
            //$scope.states.push({state: state, packages: packages, visible: false});
            //console.log(JSON.stringify($scope.states));
          }).error(function(error, httpStatus, headers, config) {
            ApiGateway.throwError(httpStatus, "CC get Packages List", config);
          }).finally(function() {
            PelApi.hideLoading();
          });
      });

      $scope.debugg = function() {
        console.log(JSON.stringify($scope.states))
      }

      $scope.toggleVisible = function(s) {
        s.visible = !s.visible;
      }
     // getPackages($http, $scope.packages,$scope.error);

    }
  ]);
