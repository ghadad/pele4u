/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('phonebookListCtrl', function($scope, ApiService, StorageService, $stateParams, $ionicLoading, $state, PelApi, Contact, $ionicModal, $ionicNavBarDelegate, $ionicHistory) {

    $scope.$on('$ionicView.beforeEnter', function() {
      // Ignore cacheView when previous state is ManiMenu
      if (!$ionicHistory.viewHistory().forwardView) {
        $scope.formData = {
          term: "",
          sectorId: ""
        };
        $scope.setForm()
      }

    });
    var AppId = $stateParams.AppId;

    function safeApply(scope, fn) {
      (scope.$$phase || scope.$root.$$phase) ? fn(): scope.$apply(fn);
    }
    $scope.formData = {
      term: "",
      sectorId: ""
    };


    $scope.title = "אלפון"
    $scope.goHome = function() {
      PelApi.goHome();
    }
    $scope.page = 'form'

    $scope.setForm = function() {
        $ionicNavBarDelegate.showBackButton(true);
      $scope.page = "form"
      $scope.searchResult = {
        cursor: {},
        list: []
      }

    }
    $scope.goBack = function() {

      $state.go("app.phonebook", {}, {
        reload: true
      })
    }



    $scope.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
      pagination: false,
      direction: 'vertical'
    }


    $scope.sectors = [];
    $scope.getSectors = function() {
      var cacheData = _.get(StorageService.get("phonebook_sectors"), "data", null);
      if (cacheData) {
        $scope.sectors = cacheData.sectors;
        $scope.operunits = cacheData.operunits;

      } else {
        ApiService.post("PhonebookGetSector", AppId)
          .success(function(data, status, headers, config) {
            var result = ApiService.checkResponse(data, status, config)
            $scope.sectors = result.sectors;
            $scope.operunits = result.operunits;
            StorageService.set("phonebook_sectors", result, 60 * 60 * 1000)
          })
          .error(function(errorStr, httpStatus, headers, config) {
            ApiService.checkResponse({
              error: errorStr
            }, httpStatus, config);
          })
      }
    }

    $scope.getSectors();
    $scope.newSearch = false;
    $scope.$watch('formData.term', function() {
      $scope.newSearch = true
      safeApply($scope, function() {
        $scope.hint = "";
        if ($scope.formData.term.length < 2) {
          //  $scope.hint = "יש להזין לפחות שתי אותיות"
          $scope.searchResult = $scope.searchResult || {};
          $scope.searchResult.isFound = null
        }
      })

    });

    $scope.$watch('formData.sector', function() {
      $scope.newSearch = true
      safeApply($scope, function() {
        $scope.hint = "";
        if ($scope.formData.term.length < 2) {
          //  $scope.hint = "יש להזין לפחות שתי אותיות"
          $scope.searchResult = $scope.searchResult || {};
          $scope.searchResult.isFound = null
        }
      })
    });


    $scope.swalContact = function(event, c) {
      //event.preventDefault();

      c.company = "פלאפון תקשורת"

      swal({

        html: '<div>' + 'האם לשמור איש קשר זה במכשירכם ? ' + '</div>' +
          '<div class="alert">' + "שים לב, איש הקשר ישמר בנייד כאיש קשר חדש" + '</div>',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'שמירה',
        confirmButtonAriaLabel: 'Thumbs up, great!',
        cancelButtonText: 'ביטול',
        cancelButtonAriaLabel: 'Thumbs down',
      }).then(function(btn) {
        if (btn.value) {
          $scope.addContact(c)
        }
      })
    }

    $scope.addContact = function(c) {
      var deviceContact = Contact.newContact();
      deviceContact = Contact.setContactData(deviceContact, c);
      deviceContact.save(function(result) {

        swal({
          type: 'success',
          title: 'איש הקשר נשמר במכשירכם',
          showConfirmButton: false,
          timer: 1500
        })
      }, function(err) {
        swal({
          text: "שגיאה בניסיון לשמור איש קשר",
          type: "error",
          timer: 1500
        });
        PelApi.throwError("app", "saveContact on phonebookDetails", JSON.stringify(err));
      })

    }


    $scope.search = function(type) {
      $scope.searchType = type;
      if (!$scope.searchType)
        $scope.searchType == "search"

      if (type == "operunits") {
        $scope.page = 'result';
        $scope.title = "טלפונים חשובים"
        return true;
      }

      var cursor = _.get($scope.searchResult, "cursor", {});
      var quantity = cursor.quantity || 0;
      var offset = cursor.offset || null;
      var checkTerm = $scope.formData.term.replace(/\s/g, '')
      if (checkTerm.length < 2) {
        $scope.hint = "יש להזין לפחות שתי אותיות"
        return false;
      }

      if ($scope.newSearch) {
        $scope.newSearch = false;
        $scope.searchResult = {
          cursor: {},
          list: []
        };
      }
      $scope.searchResult.isFound = null;
      PelApi.showLoading();
      $scope.title = "אלפון - תוצאות חיפוש"
      var termParams = $scope.formData.term.replace(/^\s+/, '').split(/\s+/);
      var p1 = termParams[0];
      var p6 = termParams[1];

      ApiService.post("PhonebookSearch", AppId, {
          p1: p1,
          p2: $scope.formData.sectorId,
          p3: offset,
          p6: p6
        })
        .success(function(data, status, headers, config) {
          var result = ApiService.checkResponse(data, status, config)
          $scope.searchResult.cursor = result.cursor;
          $scope.searchResult.list = _.concat($scope.searchResult.list, result.list);
          $scope.searchResult.isFound = result.list.length ? true : false;
          $scope.page = 'result';
          $ionicNavBarDelegate.showBackButton(false);
          if (data.list && !result.list.length) {
            $scope.page = 'form';
            $ionicNavBarDelegate.showBackButton(true);
          }
        })
        .error(function(errorStr, httpStatus, headers, config) {
          ApiService.checkResponse({
            error: errorStr
          }, httpStatus, config);

        })
    }

  });
