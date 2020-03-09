/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['ngSanitize'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('busLeadCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicModal', 'PelApi', '$ionicScrollDelegate', '$sce', 'appSettings',
    function(StorageService, ApiGateway, $scope, $state, $ionicModal, PelApi, $ionicScrollDelegate, $sce, appSettings) {
      $scope.view = "";
      $scope.subRange = ["10-50","50 מעל"]
      $scope.noOfSubscribers = $scope.subRange[0]

      $scope.contacts = [
      'בעלים',
        'מנכ"ל',
        'סמנכ"ל', 
        'בכיר בארגון',
        'אחר']
      $scope.contactTitle = $scope.contacts[0]

      $scope.forms = {}
      
      $scope.lead = {
        EMPLOYEE_ID: appSettings.config.user,
        extra: {}
      }

      function getHHRange(start, end, interval) {
        return _.range(start, end, interval).map(function(e) {
          var hh = "0" + e.toString().replace(/\./, ":").replace(/:\d+/, ":30");
          return (hh.match(":") ? hh : hh + ":00").replace(/0(\d\d)/, '$1');
        })
      }

      function toNumber(hhstr) {
        return _.toNumber(hhstr.replace(":30", ".5").replace(":00", ""));
      }

      $scope.from_hour_range = getHHRange(9, 17, 0.5);
      $scope.to_hour_range = getHHRange(9.5, 17.5, 0.5);

      $scope.recreateEndHour = function() {
        $scope.to_hour_range = getHHRange(toNumber($scope.lead.from_hour) + 0.5, 17.5, 0.5);
      }

      $scope.onValueChanged = function(leadType) {
        var extraInfo = _.get($scope, 'typesByFormType[' + leadType + '].SETUP.attrs', []);
        $scope.extraSchema = extraInfo;
        setDynamicValidation($scope.extraSchema)
      }

      $scope.getNext = function() {
        var refStamp = new Date().getTime();
        PelApi.showLoading();
        ApiGateway.get("leads/getnext", {
          refStamp: refStamp
        }).success(function(data) {
          $scope.lead.LEAD_ID = data.VAL;
          $scope.lead.FORM_TYPE = $state.params.type; //Draft
        }).error(function(error, httpStatus, headers, config) {
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized getnext api", config);
          //PelApi.throwError("api", "get new Lead seq", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, "get new Lead seq", config);
        }).finally(function() {
          PelApi.hideLoading();
        })
      }

      // if ($state.params.task && $state.params.task.TASK_NUMBER) {
      //   $scope.view = 'task';
      //   $scope.task = $state.params.task;
      //   $scope.title = "פרטי ליד: " + $scope.task.TASK_NUMBER;
      //   return true;
      // } else if ($state.params.lead && $state.params.lead.LEAD_ID) {
      //   $scope.onValueChanged($state.params.lead.LEAD_TYPE);
      //   PelApi.safeApply($scope, function() {
      //     $scope.view = "lead";
      //     $scope.lead = $state.params.lead;
      //     var found = $scope.lead.PREFERRED_HOURS.replace(/\s+/g, "").match(/(.+)-(.+)/) || ["", ""];
      //     $scope.files = $scope.lead.files;
      //     $scope.lead.from_hour = found[1] || "";
      //     $scope.lead.to_hour = found[2] || "";
      //     $scope.savedAttributes = _.clone($state.params.lead.ATTRIBUTES)
      //     $scope.storedLead = true;
      //     $scope.title = "פרטי ליד";
      //   })
      // } else {
      //   $scope.view = "lead";
      //   if ($state.params.type === 'S') {
      //     $scope.lead.FORM_TYPE = 'S'; //Draft
      //     $scope.title = "פתיחת ליד עצמי";
      //   } else {
      //     $scope.lead.FORM_TYPE = 'T'; //Draft
      //     $scope.title = "פתיחת ליד לשגרירים";
      //   }
      //   $scope.getNext();
      // }



      // $scope.openLink = function(e) {
      //   window.open(e.link, "_system")
      // }

      // $scope.delete = function(leadId) {
      //   swal({
      //     html: 'נא אשרו מחיקת ליד עצמי ',
      //     showCloseButton: true,
      //     showCancelButton: true,
      //     focusConfirm: false,
      //     confirmButtonText: 'אשור',
      //     confirmButtonAriaLabel: 'Thumbs up, great!',
      //     cancelButtonText: 'ביטול',
      //     cancelButtonAriaLabel: 'Thumbs down',
      //   }).then(function(btn) {
      //     if (btn.value) {
      //       ApiGateway.delete("leads/" + $scope.lead.LEAD_ID).success(function(data) {
      //         swal("ליד עצמי נמחק בהצלחה")
      //           .then(function(ret) {
      //             $state.go("app.leads.report", {
      //               type: $scope.lead.FORM_TYPE
      //             }, {
      //               reload: true,
      //               location: 'replace'
      //             })
      //           })
      //       }).error(function(error, httpStatus, headers, config) {
      //         //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized delete lead api", config)
      //         //PelApi.throwError("api", "delete lead by id ", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")", false)
      //         ApiGateway.throwError(httpStatus, "delete lead by id", config, false);
      //       })
      //     }
      //   })
      // }

      $scope.submit = function() {
        $scope.submitted = true;
        //console.log($scope.forms.leadForm);

        if ($scope.forms.leadForm.$invalid || !$scope.lead.REGULATIONS) {
          if(!$scope.lead.REGULATIONS)
          $ionicScrollDelegate.scrollBottom()
          return false;
        }
        
        $scope.lead.resource_value = $scope.subRange.indexOf($scope.lead.SUBSCRIBERS) + 121

        $scope.disablePost = true;
        PelApi.showLoading();
        ApiGateway.post('businessLeads/create_task', $scope.lead)
        .success(function(data) {
           console.log('create_task::Success')
        }).error(function(error, httpStatus, headers, config) {
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized getnext api", config);
          //PelApi.throwError("api", "get new Lead seq", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, eaipath, config);
        }).finally(function() {
          //PelApi.hideLoading();
          $scope.successMessage = '<h2 color="green">ליד עסקי נוצר בהצלחה</h2><br><br>'
          $scope.leadSuccess = true
        });
      }

      $scope.goToMenu = function() {
        $state.go('app.busLeads')
      }

      $scope.uploadFile = function() {
        var picFile = $scope.imageUri;

        $scope.uploadState = {
          progress: 0
        }

        var uri = encodeURI(ApiGateway.getUrl("leads/upload/" + $scope.lead.LEAD_ID));
        var options = new FileUploadOptions();
        var params = {};
        params.file = picFile;
        params.title = $scope.imageTitle;

        options.params = params;
        options.chunkedMode = false;
        var headers = ApiGateway.getHeaders();
        options.headers = headers;

        var ft = new FileTransfer();
        if ($scope.uploadTimer)
          clearTimeout($scope.uploadTimer);

        $scope.uploadTimer = setTimeout(function() {
          if ($scope.inUpload) {
            ft.abort();
          }
        }, 15000);

        function fileUploadSuccess(r) {
          if ($scope.uploadTimer)
            clearTimeout($scope.uploadTimer);
          PelApi.hideLoading();
          PelApi.safeApply($scope, function() {
            $scope.uploadState.progress = 100;
            $scope.uploadState.success = true;
            $scope.uploadState.error = false;
            $scope.imageUri = "";
            $scope.imageTitle = "";
            $scope.files.push({
              uri: $scope.imageUri,
              title: $scope.imageTitle
            })
          });
        }

        function fileUploadFailure(error) {
          if ($scope.uploadTimer)
            clearTimeout($scope.uploadTimer);
          PelApi.hideLoading();
          PelApi.throwError("api", "upload doc", JSON.stringify(error), false);
          $scope.uploadState.progress = 100;
          $scope.uploadState.error = true;
        }


        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            $scope.uploadState.progress = progressEvent.loaded / (progressEvent.total + 1);
          } else {
            $scope.increment++;
          }
        };
        $ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
        PelApi.showLoading({
          duration: 15000
        });

        $scope.inUpload = true;

        ft.upload(picFile, uri, fileUploadSuccess, fileUploadFailure, options, true);
      }


      $ionicModal.fromTemplateUrl('upload.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      }).catch(function(err) {

      });
      $scope.openModal = function() {
        $ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
        PelApi.safeApply($scope, function() {
          $scope.imageUri = "";
          $scope.uploadState = {
            progress: 0
          };
        });
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        if ($scope.modal)
          $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });


      $scope.setValidationDate = function(e) {
        if (e.min) e.computedMin = e.min;
        if (e.minus_days || e.minus_days === 0) {
          e.computedMin = moment().subtract(e.minus_days, "days").format("YYYY-MM-DD");
        }
        if (e.max) e.computedMax = e.max;
        if (e.plus_days) {
          e.computedMax = moment().add(e.plus_days, "days").format("YYYY-MM-DD");
        }
        return e;
      }

    }
  ]);