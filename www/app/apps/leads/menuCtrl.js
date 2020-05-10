/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('menuCtrl', ['$scope', '$state', 'StorageService', 'ApiGateway', 'PelApi', '$ionicModal',
    function($scope, $state, StorageService, ApiGateway, PelApi, $ionicModal) {

      ApiGateway.head("leads").success(function(data) {}).error(function(error, httpStatus, headers, config) {
        ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized get leads/conf   api", config);
      });

      $scope.stateType = ""
      $scope.prevState = "";
      if ($state.is("app.leads.self")) {
        $scope.stateType = "S"
        //$scope.title = "הלידים שלי"
        $scope.prevState = "app.leads.self";
      } else if ($state.is("app.leads.task")) {
        //$scope.title = "שגרירים כאן בשבילך"
        $scope.stateType = "T"
        $scope.prevState = "app.leads.task";
      }
      $scope.$root.title = $state.params.Title;
      $scope.title = $state.params.Title;
      var getInfo = function() {
        console.log(_.get($scope.conf, "clientConfig", {}))
        return _.get($scope.conf, "clientConfig", {})
      }


      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf", {})
        $scope.info = getInfo();
        if ($scope.conf.types) {
          return;
        }
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60);
          $scope.conf = data;
          $scope.info = getInfo();
        }).error(function(error, httpStatus, headers, config) {
          //  ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized get leads/conf   api", config);
          //  PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, "get Leads conf table", config);
        }).finally(function() {

        })
      }

      $scope.getConf();

      $ionicModal.fromTemplateUrl('leadInfo.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function() {

        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };

      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
    }

  ]);