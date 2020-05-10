/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['ngSanitize'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicModal', 'PelApi', '$ionicScrollDelegate', '$sce', '$ionicHistory',
    function(StorageService, ApiGateway, $scope, $state, $ionicModal, PelApi, $ionicScrollDelegate, $sce, $ionicHistory) {
      $scope.view = "";

      $scope.forms = {}

      $scope.uploadState = {
        progress: 0
      };
      $scope.storedLead = false;
      $scope.files = [];
      $scope.lead = {
        ATTRIBUTES: {}
      };

      $scope.trust = function(html) {
        if (typeof html === "undefined")
          html = "<span></span>";
        return $sce.trustAsHtml(html);
      }

      $scope.takePic = function(sourceType) {
        PelApi.safeApply($scope, function() {
          $scope.imageUri = "";
          $scope.uploadState = {
            progress: 0
          };
        });

        var options = {
          quality: 100,
          encodingType: Camera.EncodingType.JPEG,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          destinationType: Camera.DestinationType.FILE_URI,
          targetWidth: 794,
          targetHeight: 1122,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };

        if (sourceType === 'CAMERA') {
          options.sourceType = Camera.PictureSourceType.CAMERA;
        } else {
          options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        }

        navigator.camera.getPicture(function(imageUri) {
          if (PelApi.isAndroid) {
            window.FilePath.resolveNativePath(imageUri, function(path) {
              PelApi.safeApply($scope, function() {
                $scope.imageUri = path;
              });
            }, function(err) {

            });
          } else {
            PelApi.safeApply($scope, function() {
              $scope.imageUri = imageUri;
            });
          }

        }, function(err) {

        }, options);

        return true;
      }

      $scope.lead = {
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

      if ($state.params.task && $state.params.task.TASK_NUMBER) {
        $scope.view = 'task';
        $scope.task = $state.params.task;
        $scope.title = "פרטי ליד: " + $scope.task.TASK_NUMBER;
        return true;
      } else if ($state.params.lead && $state.params.lead.LEAD_ID) {
        $scope.onValueChanged($state.params.lead.LEAD_TYPE);
        PelApi.safeApply($scope, function() {
          $scope.view = "lead";
          $scope.lead = $state.params.lead;
          var found = $scope.lead.PREFERRED_HOURS.replace(/\s+/g, "").match(/(.+)-(.+)/) || ["", ""];
          $scope.files = $scope.lead.files;
          $scope.lead.from_hour = found[1] || "";
          $scope.lead.to_hour = found[2] || "";
          $scope.savedAttributes = _.clone($state.params.lead.ATTRIBUTES)
          $scope.storedLead = true;
          $scope.title = "פרטי ליד";
        })
      } else {
        $scope.view = "lead";
        if ($state.params.type === 'S') {
          $scope.lead.FORM_TYPE = 'S'; //Draft
          $scope.title = "פתיחת ליד עצמי";
        } else {
          $scope.lead.FORM_TYPE = 'T'; //Draft
          $scope.title = "פתיחת ליד לשגרירים";
        }
        $scope.getNext();
      }



      $scope.openLink = function(e) {
        window.open(e.link, "_system")
      }

      function setDynamicValidation(varr) {

        $scope.uploadRequired = false
        $scope.uploadExists = false;

        _.set($scope.lead, 'ATTRIBUTES', {});

        if ($scope.lead.FORM_TYPE == 'S') {

          var leadDescription = _.get($scope, 'typesByFormType[' + $scope.lead.LEAD_TYPE + '].DESCRIPTION', "")
          //alert(leadDescription)
          _.set($scope.lead.ATTRIBUTES, 'lead_description', leadDescription);
          _.set($scope.savedAttributes, 'lead_description', leadDescription);
        }

        varr.forEach(function(v, index) {
          v.inputFieldInd = true;
          if (!v.attribute_name) {
            v.attribute_name = "junk_attribute"
            v.inputFieldInd = false;
          }

          var savedAttrValeu = _.get($scope.savedAttributes, v.attribute_name);
          _.set($scope.lead.ATTRIBUTES, v.attribute_name, savedAttrValeu);

          if (v.type === "identity.id") {
            v.inputFieldInd = false;
            PelApi.safeApply($scope, function() {
              _.set($scope.lead, 'ATTRIBUTES[' + v.attribute_name + ']', "");
              $scope.extraSchema[index] = _.extend($scope.extraSchema[index], "");
            })
          }

          if (v.type === "const") {
            v.inputFieldInd = false;
            PelApi.safeApply($scope, function() {
              _.set($scope.lead, 'ATTRIBUTES[' + v.attribute_name + ']', v.value);
              $scope.extraSchema[index] = _.extend($scope.extraSchema[index], v.value);
            })
          }

          if (v.type === "html" || v.type === "link") {
            v.inputFieldInd = false;
          }
          if (v.service) {
            v.progress = true;
            v.serviceStatus = "";
            ApiGateway.get(v.service, {}).success(function(data) {
              v.serviceStatus = "success"
              _.set($scope.lead, 'ATTRIBUTES[' + v.attribute_name + ']', data.value);
              $scope.extraSchema[index] = _.extend($scope.extraSchema[index], data);
            }).error(function(error, httpStatus, headers, config) {
              v.serviceStatus = "error"
              if (v.default) {
                _.set($scope.lead, 'ATTRIBUTES[' + v.attribute_name + ']', v.default);
                $scope.extraSchema[index] = _.extend($scope.extraSchema[index], v.default);
              }
              //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized " + v.service + " api", config)
              //PelApi.throwError("api", "get Leads form element  service :" + v.service, "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")", false)
              ApiGateway.throwError(httpStatus, "get Leads form element  service:" + v.service, config, false);
            }).finally(function() {
              v.progress = false;
            })
          }

          if (v.type === "select" && v.min && v.max && v.step) {
            v.options = [""].concat(_.range(v.min, v.max + v.step, v.step));
          }

          if (v.type === "upload") {
            v.inputFieldInd = false;
            PelApi.safeApply($scope, function() {
              $scope.uploadExists = true;
              $scope.uploadRequired = v.required;
            })
          }
          if (v.type === "checkbox") {
            if (typeof v.trueValue === "undefined")
              v.trueValue = 1;
            if (typeof v.falseValue === "undefined")
              v.falseValue = 0;
          }
          if (v.type === "date") {
            v = $scope.setValidationDate(v)
          }
        })
      }

      $scope.setDynamicValidation = setDynamicValidation;
      $scope.display = function(e) {
        e.show = "true"
      }


      $scope.actionSheet = function() {
        var btns = [{
          text: "לא רלוונטי"
        }, {
          text: "טופל בהצלחה"
        }, {
          text: "ממתין למלאי"
        }, {
          text: "לקוח לא ענה"
        }, {
          text: "סגור ללא הצלחה"
        }]
        var conf_actions = _.get($scope.conf, "clientConfig['leads.client.actions']");
        if (conf_actions) btns = conf_actions;
        var actionsObject = {
          title: "<h3 class='pele_rtl text-center'>" + "עדכון סטאטוס" + "</h3>",
          btns: btns,
          cssClass: "lead-actions-sheet",
          destructiveText: '<i class="icon ion-trash-a"></i> ' + 'מחק ליד',
          cancelText: 'ביטול',
          destructiveButtonClicked: function(index) {
            $scope.delete();
            //your function
            return false;
          }
        };

        PelApi.actionSheet(actionsObject, function(index, btn) {
          $scope.lead.ATTRIBUTES['lead_status'] = btn.text;
          $scope.savedAttributes['lead_status'] = btn.text;
          return true;
        })
      }

      $scope.extraData = {};

      $scope.getRelevantLeadsType = function(types) {
        $scope.typesByFormType = {};
        types.forEach(function(t) {
          if ($scope.lead.FORM_TYPE === t.FORM_TYPE)
            $scope.typesByFormType[t.TYPE] = t
        })

      }

      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf", {})
        if ($scope.conf.types) {
          $scope.getRelevantLeadsType($scope.conf.types)
          return true;
        }
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
          $scope.conf = data;
          $scope.getRelevantLeadsType($scope.conf.types);
        }).error(function(error, httpStatus, headers, config) {
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized leads/conf api", config)
          //PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, "get Leads conf table", config);
        }).finally(function() {
          PelApi.hideLoading();
        })
      }

      $scope.getConf();

      $scope.delete = function(leadId) {
        swal({
          html: 'נא אשרו מחיקת ליד עצמי ',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: 'אשור',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: 'ביטול',
          cancelButtonAriaLabel: 'Thumbs down',
        }).then(function(btn) {
          if (btn.value) {
            ApiGateway.delete("leads/" + $scope.lead.LEAD_ID).success(function(data) {
              swal("ליד עצמי נמחק בהצלחה")
                .then(function(ret) {
                  $state.go("app.leads.report", {
                    type: $scope.lead.FORM_TYPE
                  }, {
                    reload: true,
                    location: 'replace'
                  })
                })
            }).error(function(error, httpStatus, headers, config) {
              //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized delete lead api", config)
              //PelApi.throwError("api", "delete lead by id ", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")", false)
              ApiGateway.throwError(httpStatus, "delete lead by id", config, false);
            })
          }
        })
      }

      $scope.submit = function() {
        $scope.submitted = true;
        if ($scope.forms.leadForm.$invalid || !$scope.lead.LEAD_TYPE) {
          return false;
        }

        var leadConf = _.get($scope.typesByFormType, $scope.lead.LEAD_TYPE);
        if (!leadConf)
          PelApi.throwError("app", "Failed to fetch lead Config ,leadType:" + $scope.lead.LEAD_TYPE, "");


        $scope.lead.TASK_LEVEL = leadConf.TASK_LEVEL;
        $scope.lead.TASK_FOLLOWUP_TYPE = leadConf.TASK_FOLLOWUP_TYPE;
        $scope.lead.RESOURCE_TYPE = leadConf.RESOURCE_TYPE;
        $scope.lead.RESOURCE_VALUE = leadConf.RESOURCE_VALUE;

        $scope.lead.PREFERRED_HOURS = ($scope.lead.from_hour || "") + " - " + ($scope.lead.to_hour || "");

        //        $scope.lead.ATTRIBUTES['customer_id'] = $scope.lead.CUSTOMER_ID;
        //        $scope.lead.ATTRIBUTES['phone_no_2'] = $scope.lead.PHONE_NO_2;

        if ($scope.uploadRequired && !$scope.files.length) {
          swal({
            type: 'error',
            title: '',
            text: 'נא צרפו מסמכים כנדרש',
            confirmButtonText: 'אשור',
          })
          return false;
        }
        $scope.disablePost = true;
        PelApi.showLoading();
        ApiGateway.post("leads", $scope.lead, {
          timeout: 20000,
          retry: 0
        }).success(function(data) {
          $scope.leadSuccess = true;
          if ($state.params.lead && $state.params.lead.LEAD_ID)
            $scope.successMessage = "הליד נשמר בהצלחה";
          else
            $scope.successMessage = $scope.trust(leadConf.SUCCESS_MESSAGE);
          $scope.lead = {};
          $ionicScrollDelegate.$getByHandle('mainContent').scrollTop(true);
        }).error(function(error, httpStatus, headers, config) {
          PelApi.safeApply($scope, function() {
            $scope.disablePost = false;
          });
          //ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized post lead  lead api", config);
          //PelApi.throwError("api", "Post new lead", "httpStatus : " + httpStatus + " " + JSON.stringify(error) + "(MS:" + config.ms + ")")
          ApiGateway.throwError(httpStatus, "Post new lead", config);
        }).finally(function() {
          PelApi.safeApply($scope, function() {
            $scope.disablePost = false;
          });
          PelApi.hideLoading();
        })
      }


      $scope.stopLoading = function() {
        PelApi.hideLoading();
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