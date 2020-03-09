/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsReportsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', 'PelApi',
    function(StorageService, ApiGateway, $scope, $state, PelApi) {

      //$ionicHistory.clearHistory();

      $scope.activeGroup = PelApi.sessionStorage.activeAccordionGroup;
      $scope.toggleActive = function(g) {
        if ($scope.activeGroup === g.groupName)
          $scope.activeGroup = ""
        else
          $scope.activeGroup = g.groupName;
        PelApi.sessionStorage.activeAccordionGroup = $scope.activeGroup;
      }

      $scope.type = $state.params.type;

      $scope.createGroups = function() {
        $scope.docsGroups = {};
        if ($state.params.type === "S") {
          $scope.docsGroups['פתוח'] = {
            groupName: "פתוח",
            leads: []
          };
          $scope.leads.forEach(function(l) {
            var leadStatus = _.get(l.ATTRIBUTES, 'lead_status', "פתוח");
            if (typeof $scope.docsGroups[leadStatus] == "undefined")
              $scope.docsGroups[leadStatus] = {
                groupName: leadStatus,
                leads: []
              };
            $scope.docsGroups[leadStatus].leads.push(l)
          })
        } else if ($state.params.type === "T") {

          $scope.leads.forEach(function(l) {
            if (typeof $scope.docsGroups[l.TASK_STATUS] == "undefined")
              $scope.docsGroups[l.TASK_STATUS] = {
                groupName: l.TASK_STATUS,
                leads: []
              };
            $scope.docsGroups[l.TASK_STATUS].leads.push(l)
          })
        }

      }


      $scope.statusClass = {
        'סגור ללא הצלחה': 'string-badge pel-badge pink',
        'טופל בהצלחה': 'string-badge pel-badge green',
        'לקוח לא ענה': 'string-badge pel-badge  light-blue',
        'ממתין למלאי': 'string-badge pel-badge  cyan',
        'התקבל מענה': 'string-badge pel-badge  green',
        'נסגר טיפול': 'string-badge pel-badge  light-blue',
      }

      if ($state.params.type === "S") {
        $scope.title = "לידים שפתחתי";
        $scope.prevState = "app.leads.self"
      } else {
        $scope.title = "לידים שלי לשגרירים";
        $scope.prevState = "app.leads.task"
      }

      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf")
        if ($scope.conf.types) return;
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
          $scope.conf = data;
        }).error(function(error, httpStatus, headers, config) {
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized get leads/conf   api", config);
          //PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, "get Leads conf table", config);
        })
      }

      $scope.showLead = function(lead) {
        $state.go("app.leads.lead", {
          lead: lead
        })
      }

      $scope.showTask = function(task) {
        $state.go("app.leads.lead", {
          task: task
        })
      }
      $scope.getData = function() {
        var service = "leads/";
        if ($state.params.type === "T")
          service += "tasks";
        PelApi.showLoading();
        ApiGateway.get(service, {
          type: $state.params.type
        }).success(function(data) {
          $scope.leads = data;
          $scope.createGroups();
        }).error(function(error, httpStatus, headers, config) {
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized get leads/tasks  api", config);
          ApiGateway.throwError(httpStatus, "fetch leads list by type ", config)
        }).finally(function() {
          PelApi.hideLoading();
        })
      }

      //$scope.getConf();
      $scope.getData();
    }
  ]);