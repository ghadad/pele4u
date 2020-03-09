/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('p4_hr_docCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$q', '$location', '$window', '$timeout', '$ionicLoading', '$ionicActionSheet', '$ionicModal', 'PelApi', '$ionicHistory', '$cordovaNetwork', '$ionicPopup', 'appSettings', '$sessionStorage', function($rootScope, $scope, $stateParams, $http, $q, $location, $window, $timeout, $ionicLoading, $ionicActionSheet, $ionicModal, PelApi, $ionicHistory, $cordovaNetwork, $ionicPopup, appSettings, $sessionStorage) {
    //---------------------------------
    //--       goHome
    //---------------------------------
    $scope.goHome = function() {
      PelApi.goHome();
    }
    $scope.appId = $stateParams.AppId;

    //---------------------------------------------------------------------------
    //--                         openExistText
    //---------------------------------------------------------------------------
    $scope.openExistText = function(text) {
      $scope.data = {};
      $scope.data.docText1 = text;
      if (text !== null) {
        var myPopup = $ionicPopup.show({
          template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" readonly="true" ng-model="data.docText1" type="text" >{{data.docText1}}</textarea></label></div>',
          title: '<a class="float-right"></a>',
          subTitle: '',
          scope: $scope,
          buttons: [{
            text: '<a class="pele-popup-positive-text-collot">סגור</a>',
            type: 'button-positive',
            onTap: function(e) {}
          }, ]
        });

      }
    } // openExistText
    //---------------------------------------------------------------------------
    //--                         isGroupShown
    //---------------------------------------------------------------------------
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    } // isGroupShown
    //---------------------------------------------------------------------------
    //--                         isGroupShown
    //---------------------------------------------------------------------------
    $scope.isHourException12Shown = function(exception_note) {
      var retVal = true;

      if (exception_note === undefined || exception_note === " ") {
        retVal = false;
      }

      return retVal;
    } // isGroupShown
    //---------------------------------------------------------------------------
    //--                         getApproveListActionIcon
    //---------------------------------------------------------------------------

    $scope.getApproveListActionIcon = function(action, date, note) {

      var icon_class;
      if (appSettings.ACTION_HISTORY.FORWARD === action) {
        icon_class = "ion-checkmark-circled";
      } else if (appSettings.ACTION_HISTORY.NO_ACTION === action) {
        icon_class = "ion-minus-circled";
      } else if (appSettings.ACTION_HISTORY.REJECT === action) {
        icon_class = "ion-close-circled";
      } else if (appSettings.ACTION_HISTORY.WAITING === action) {
        //icon_class = "ion-pause";
        icon_class = "";
      } else {
        icon_class = "";
      }

      return icon_class;


    } // getApproveListActionIcon
    //--------------------------------------------------------------------------//
    //-- When         Who             Description                             --//
    //-- ===========  ==============  ========================================--//
    //-- 29/02/2016   R.W.
    //--------------------------------------------------------------------------//
    $scope.showIconCollapseInAcctionHistory = function(showFlag, hidenFlag) {
      var retVal = "";
      if (hidenFlag === true) {
        retVal = "";
      } else if (showFlag === true) {
        retVal = "icon-collapse";
      } else if (showFlag === false) {
        retVal = "icon-expand";
      }

      return retVal;

    }
    //---------------------------------------------------------------------------
    //--                         isGroupShown
    //---------------------------------------------------------------------------
    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    //----------------------------------------------------------------------------
    //----------------------------------------------------------------------------
    $scope.addPushFlagToActionHistory = function(arr) {
      var myArr = [];
      var j = arr.length;
      for (var i = 0; i < arr.length; i++, j--) {
        var showFlag = false;
        var hideFlag = false
        if (arr[i].NOTE !== "" && arr[i].NOTE != undefined) {
          showFlag = false;
        } else {
          showFlag = true;
        };

        var l_displayFlag = arr[j - 1].DISPLAY_FLAG;
        var l_actionCode = arr[j - 1].ACTION_CODE;
        if ((arr[i].ACTION === "" || arr[i].ACTION === undefined || arr[i].ACTION === null) &&
          (arr[i].ACTION_DATE === "" || arr[i].ACTION_DATE === undefined || arr[i].ACTION_DATE === null)) {
          hideFlag = true
        }


        var mayObj = {
          "DISPLAY_FLAG": arr[i].DISPLAY_FLAG,
          "DOC_INIT_ID": arr[i].DOC_INIT_ID,
          "APPROVAL_SEQ": arr[i].APPROVAL_SEQ,
          "CREATION_DATE": arr[i].CREATION_DATE,
          "USER_NAME": arr[i].USER_NAME,
          "ACTION": arr[i].ACTION,
          "ACTION_DATE": arr[i].ACTION_DATE,
          "NOTE": arr[i].NOTE,
          "SEQUENCE_NUM": i + 1,
          "SHOW_FLAG": showFlag,
          "HIDEN_FLAG": hideFlag,
          "PUSH_COUNT": 0
        }

        myArr.push(mayObj);

      } // for

      return myArr;
    } // addPushFlagToActionHistory
    //----------------------------------------------------------------
    //-- When         Who       Description
    //-- ===========  ========  ======================================
    //-- 17/03/2016   R.W.
    //----------------------------------------------------------------
    $scope.hidenAcctionHistoryDetails = function(showFlag, hidenFlag, pushCount, note) {
      var retVal = "";
      if (hidenFlag === true) {
        retVal = true;
      } else if (showFlag === true) {
        if (pushCount === 0) {
          if (note !== "" && note !== undefined && note !== null) {
            retVal = false;
          } else {
            retVal = true;
          }
        } else {
          retVal = true;
        }

      } else if (showFlag === false) {
        retVal = false;
      }
      return retVal;

    }
    //---------------------------------------------------------------------------
    //--                         doRefresh
    //---------------------------------------------------------------------------
    $scope.doRefresh = function() {
      $scope.data = {};
      $scope.feed = [];
      $scope.tabs = appSettings.tabs;

      var buttons = {};
      //buttons.approve = true;


      $scope.style = {
        color: 'red'
      };

      //var appId = $stateParams.AppId,
      var appId = $stateParams.AppId,
        docId = $stateParams.DocId,
        docInitId = $stateParams.DocInitId;

      $sessionStorage.DOC_ID = docId;

      if (appSettings.config.docDetails.DOC_LINES && appSettings.config.docDetails.DOC_LINES.length > 1) {
        $scope.shownGroup = null;
      } else {
        if (docId === "807") {
          $scope.shownGroup = appSettings.config.docDetails.DOC_LINES[0].ATTRIBUTE2;
        } else {
          $scope.shownGroup = appSettings.config.docDetails.DOC_LINES[0].EFFECTIVE_DATE;
        }
      }
      $scope.buttonsArr = appSettings.config.docDetails.BUTTONS;
      $scope.docDetails = appSettings.config.docDetails;
      $scope.sourceTitle = appSettings.config.docDetails.DOC_NAME;
      $scope.CREATOR = appSettings.config.docDetails.CREATOR;
      $scope.EMP_NUMBER = appSettings.config.docDetails.EMP_NUMBER;
      $scope.SECTOR = appSettings.config.docDetails.SECTOR;
      $scope.DEPARTMENT = appSettings.config.docDetails.DEPARTMENT;
      $scope.DOC_INIT_ID = appSettings.config.docDetails.DOC_INIT_ID;
      $scope.SENT_DATE = appSettings.config.docDetails.SENT_DATE;
      $scope.NOTIFICATION_ID = appSettings.config.docDetails.NOTIFICATION_ID;
      $scope.HOLIDAY_BALANCE = appSettings.config.docDetails.HOLIDAY_BALANCE;

      $scope.ACTION_HISTORY = $scope.addPushFlagToActionHistory(appSettings.config.docDetails.ACTION_HISTORY);

      $scope.approve = appSettings.config.ApprovRejectBtnDisplay;

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    }; // doRefresh

    $scope.redStyle = function(flag) {
      var retVal;
      if ("Y" === flag) {
        $scope.style.color = "red";
      } else if ("N" === flag) {
        $scope.style.color = "black";
      }
      return $scope.style;
    };
    //---------------------------------------------------------------------
    //-- When           Who             Description
    //-- -------------	--------------  -----------------------------------
    //-- 13/10/2015     R.W.            Hide / Show Approval List Rows
    //---------------------------------------------------------------------
    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.createNote = function(u) {
      $scope.Note = u.Note;
      $scope.modal.hide();
    };
    //---------------------------------------------------------------------
    //-- When           Who             Description
    //-- -------------	--------------  -----------------------------------
    //-- 13/10/2015     R.W.            Hide / Show Approval List Rows
    //---------------------------------------------------------------------
    $scope.pelHideShow = function(action, note) {
      var retStatus;
      if (action != "" && action != undefined) {
        retStatus = false;
      } else {
        retStatus = true;
      }

      if (retStatus && note != "" && note != undefined) {
        retStatus = false;
      }
      return retStatus;
    };

    $scope.onSlideMove = function(data) {
      //alert("You have selected " + data.index + " tab");
    };
    //-----------------------------------
    //--         Btn Action
    //-----------------------------------
    $scope.docApprove = function() {

      //var appId = $stateParams.AppId;
      var appId = $scope.appId;
      var notificationId = $scope.NOTIFICATION_ID;
      var actionType = 'APPROVE';
      var note = '';
      //===================================================//
      //==        Add Note Yes/No popup
      //===================================================//
      var myYesNoPopup = $ionicPopup.show({
        title: appSettings.config.isAddNoteTitle,
        subTitle: '',
        scope: $scope,
        buttons: [{
            text: '<a class="pele-popup-positive-text-collot">כן</a>',
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          },
          {
            text: '<a class="pele-popup-positive-text-collot">לא</a>',
            type: 'button-assertive',
            onTap: function(e) {

              return false;
            }
          },
        ]
      });
      myYesNoPopup.then(function(res) {
        if (res) {
          //===============================================//
          //==                 Get Note                  ==//
          //===============================================//
          $scope.data = {};
          var myPopup = $ionicPopup.show({
            template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" ng-model="data.note" type="text"></textarea></label></div>',
            title: '<a class="float-right">הערות</a>',
            subTitle: '',
            scope: $scope,
            buttons: [{
                text: '<a class="pele-popup-positive-text-collot">שמירה</a>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!PelApi.isValidNote($scope.data.note)) {
                    e.preventDefault();
                    PelApi.showPopup("יש להזין הערה", "יש להזין לפחות 2 אותיות");
                  } else {
                    $scope.data.cancel = false;
                    return $scope.data;
                  }
                }
              },
              {
                text: 'ביטול',
                type: 'button-assertive',
                onTap: function(e) {
                  $scope.data.note = "";
                  $scope.data.cancel = true;
                  return $scope.data;
                }
              },
            ]
          });
          myPopup.then(function(res) {
            if (!res.cancel) {
              PelApi.showLoading();
              note = res.note;
              var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
              var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
              retSubmitNotification.success(function(data, status) {

                var stat = PelApi.GetPinCodeStatus(data, "GetUserNotif");
                var pinStatus = stat.status;

                if ("EOL" === pinStatus) {
                  appSettings.config.IS_TOKEN_VALID = "N";
                  $scope.goHome();
                } else if ("EAI_ERROR" === pinStatus) {
                  //PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
                  PelApi.throwError("eai", "SubmitNotif", JSON.stringify(data))
                } else if ("ERROR_CODE" === pinStatus) {
                  PelApi.throwError("app", "SubmitNotif", JSON.stringify(data))
                  //PelApi.showPopup(stat.description, "");
                } else if ("OLD" === pinStatus) {
                  PelApi.showPopupVersionUpdate(data.StatusDesc, "");
                }

              }).error(function(error, httpStatus, headers, config) {
                var time = config.responseTimestamp - config.requestTimestamp;
                var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
                PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus + tr)
              }).finally(function() {
                $ionicLoading.hide();
                $scope.$broadcast('scroll.refreshComplete');
                //$ionicNavBarDelegate.back();
              });
            }
          });
        } else {
          PelApi.showLoading();
          var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
          var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
          retSubmitNotification.success(function(data, status, headers, config) {

            var stat = PelApi.GetPinCodeStatus(data, "SubmitNotif");
            var pinStatus = stat.status;

            if ("EOL" === pinStatus) {
              $scope.goHome();
            } else if ("EAI_ERROR" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              //  PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
              PelApi.throwError("eai", "SubmitNotif", JSON.stringify(data));

            }

          }).error(function(error, httpStatus, headers, config) {
            var time = config.responseTimestamp - config.requestTimestamp;
            var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
            PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus + tr)
          }).finally(function() {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            $ionicHistory.goBack();
          });
        };
      });
    };
    //-----------------------------------
    //--         OK
    //-----------------------------------
    $scope.docOK = function() {

      //var appId = $stateParams.AppId;
      var appId = $scope.appId;
      var notificationId = $scope.NOTIFICATION_ID;
      var actionType = 'OK';
      var note = '';

      PelApi.showLoading();
      var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
      var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
      retSubmitNotification.success(function(data, status) {

        var stat = PelApi.GetPinCodeStatus(data, "SubmitNotif");
        var pinStatus = stat.status;
        if ("EOL" === pinStatus) {
          $scope.goHome();
        } else if ("EAI_ERROR" === pinStatus) {
          //PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
          PelApi.throwError("eai", "SubmitNotif", JSON.stringify(data))
        } else if ("ERROR_CODE" === pinStatus) {
          //PelApi.showPopup(stat.description, "");
          PelApi.throwError("app", "SubmitNotif", JSON.stringify(data))
        } else {
          $ionicHistory.goBack();
        }
      }).error(
        function(error, httpStatus, headers, config) {
          var time = config.responseTimestamp - config.requestTimestamp;
          var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
          PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus + tr)
        }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
        //$ionicNavBarDelegate.back();
      });
    };
    //----------------------------------------
    //--         REJECT                     --
    //----------------------------------------
    $scope.docReject = function() {
      //var appId = $stateParams.AppId;
      var appId = $scope.appId;
      var notificationId = $scope.NOTIFICATION_ID;
      var actionType = "REJECT";

      if ($scope.data.note !== undefined) {
        $scope.submitNotif(actionType, $scope.data.note)
      } else {
        var myPopup = $ionicPopup.show({
          template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" ng-model="data.note" type="text">{{data.note}}</textarea></label></div>',
          title: '<a class="float-right">הערות</a>',
          subTitle: '',
          scope: $scope,
          buttons: [{

              text: '<a class="pele-popup-positive-text-collot">שמירה</a>',
              type: 'button-positive',
              onTap: function(e) {
                if (!PelApi.isValidNote($scope.data.note)) {
                  e.preventDefault();
                  PelApi.showPopup("יש להזין הערה", "יש להזין לפחות 2 אותיות");
                } else {

                  return $scope.data.note;
                }
              }
            },
            {
              text: 'ביטול',
              type: 'button-assertive'
            },
          ]
        });
        myPopup.then(function(res) {
          note = res
          if (note !== undefined) {
            $scope.submitNotif(actionType, note);
          }
        });
      }
    }; // docReject
    //--------------------------------------------------------------
    //
    //--------------------------------------------------------------
    $scope.submitNotif = function(action, note) {
      //var appId = $stateParams.AppId;
      var appId = $scope.appId;

      var notificationId = $scope.NOTIFICATION_ID;
      var actionType = action;

      PelApi.showLoading();
      var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
      var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
      retSubmitNotification.success(function(data, status, headers, config) {


        var stat = PelApi.GetPinCodeStatus(data, "SubmitNotif");
        var pinStatus = stat.status;
        if ("EOL" === pinStatus) {
          $scope.goHome();
        } else if ("EAI_ERROR" === pinStatus) {
          PelApi.throwError("eai", "SubmitNotif", JSON.stringify(data))

        } else if ("ERROR_CODE" === pinStatus) {
          PelApi.throwError("app", "SubmitNotif", JSON.stringify(data))
        } else {

          $ionicHistory.goBack();
        }
      }).error(function(error, httpStatus, headers, config) {
        var time = config.responseTimestamp - config.requestTimestamp;
        var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
        PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus + tr)
      }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });

    };
    //--------------------------------------------------------------
    //-- When         Who       Description
    //-- -----------  --------  ------------------------------------
    //-- 06/01/2016   R.W.
    //--------------------------------------------------------------
    $scope.NotePopup = function() {
      var myPopup = $ionicPopup.show({
        template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" ng-model="data.note" type="text">{{data.note}}</textarea></label></div>',
        title: '<a class="float-right">הערות</a>',
        subTitle: '',
        scope: $scope,
        buttons: [{

            text: '<a class="pele-popup-positive-text-collot">המשך</a>',
            type: 'button-positive',
            onTap: function(e) {
              if (!PelApi.isValidNote($scope.data.note)) {
                e.preventDefault();
                PelApi.showPopup("יש להזין הערה", "יש להזין לפחות 2 אותיות");
              } else {

                return $scope.data.note;
              }
            }
          },
          {
            text: 'ביטול',
            type: 'button-assertive',
            onTap: function(e) {
              return $scope.data.note;
            }
          },
        ]
      });
      myPopup.then(function(res) {
        $scope.data.note = res;
      });
    }; // NotePopup
    //--------------------------------------------------------------
    //--           Button Action
    //--------------------------------------------------------------
    $scope.showBtnActions = function() {
      var buttons = PelApi.getButtons($scope.buttonsArr);
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: buttons,
        titleText: 'רשימת פעולות עבור טופס',
        cancelText: 'ביטול',
        //-----------------------------------------------
        //--               CANCEL
        //-----------------------------------------------
        cancel: function() {
          // add cancel code..
          return true;
        },
        //-----------------------------------------------
        //--               BUTTONS
        //-----------------------------------------------
        buttonClicked: function(index, button) {
          var note = $scope.data.note;
          // add buttons code..
          if (button === appSettings.OK) {
            $scope.submitNotif("OK", note);
          }
          if (button === appSettings.APPROVE) {

            $scope.submitNotif("APPROVE", note);
          }
          if (button === appSettings.REJECT) {
            $scope.docReject();
          }
          return true;
        },
      });
    }

    $scope.doRefresh();
  }]);
