/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('phonebookDetailsCtrl', ['Contact', 'ApiService', '$state', '$rootScope', '$scope', '$stateParams', '$ionicLoading', 'PelApi', '$cordovaSocialSharing', '$ionicNavBarDelegate',
    function(Contact, ApiService, $state, $rootScope, $scope, $stateParams, $ionicLoading, PelApi, $cordovaSocialSharing, $ionicNavBarDelegate) {
      var appId = $stateParams.AppId;
      var personId = $stateParams.personId;
      $scope.today = moment().format('DD/MM');;
      $scope.title = "אלפון";
      $scope.view = "normal";
      $scope.searchForm = {};
      $scope.targetContactId = "";
      $ionicNavBarDelegate.showBackButton(true);

      function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn(): scope.$apply(fn);
      }

      $scope.goSearchForm = function() {
        $state.go("app.phonebook", {
          AppId: appId,
          reload: new Date().getTime()
        }, {
          reload: true
        })
      }

      $scope.saveContact = function(c, info) {
        var deviceContact = c;
        if (c.id) {
          deviceContact = Contact.newContact();
          deviceContact.id = c.id
        }
        deviceContact = Contact.setContactData(deviceContact, info);

        deviceContact.save(function(result) {
          swal({
            type: 'success',
            title: 'איש הקשר נשמר במכשירכם',
            showConfirmButton: false,
            timer: 1500
          })
          safeApply($scope, function() {
            $scope.view = 'Contact'
          })
        }, function(err) {
          PelApi.throwError("app", "saveContact on phonebookDetails", JSON.stringify(err));
          swal({
            text: "שגיאה בניסיון לשמור איש קשר",
            type: "error",
            timer: 1500
          });
        })
      }

      $scope.swalContact = function(event, c) {
        swal({
          html: '<div>' + "שים לב, איש הקשר ישמר בנייד כאיש קשר חדש" + '</div>',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: 'שמירה',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: 'ביטול',
          cancelButtonAriaLabel: 'Thumbs down',
        }).then(function(btn) {
          if (btn.value) {
            var targetContact = Contact.setContactData(Contact.newContact(), c);
            $scope.saveContact(targetContact, c)
          }
        })
      }



      $scope.shareViaEmail = function(email) {
        $cordovaSocialSharing.shareViaEmail(null, null, [email]);
      }

      $scope.shareViaSMS = function(mobilePhone) {

        $cordovaSocialSharing.shareViaSMS(null, mobilePhone);

      }

      $scope.shareViaWhatsAppToReceiver = function(mobilePhone) {
        $cordovaSocialSharing.shareViaWhatsAppToReceiver(mobilePhone)
        $cordovaSocialSharing.shareViaWhatsAppToReceiver(100)
      }

      $scope.shareViaWhatsApp = function() {
        alert('shareViaWhatsApp')
        $cordovaSocialSharing.shareViaWhatsApp()
      }

      $scope.empPic = function(base64String) {
        return "data:image/jpg;" + base64String;
      }

      $scope.managerInfo = {}

      $scope.getTreeData = function(person) {
        var tree = {};

        tree[person.personId] = person;
        tree[person.personId].members = [];
        $scope.treeHeight = (person.orgTree.length * 31 + 100) + 'px';
        person.orgTree.forEach(function(c) {
          if (c.personId == person.directManagerNumber) {
            $scope.managerInfo = c;
            return false;
          }


          if (c.relation === "colleague") {
            if (tree[c.personId] === undefined)
              tree[c.personId] = c;
          } else if (c.relation === "managed") {
            tree[person.personId].members.push(c)
          }

        })
        return tree;
      }

      $scope.getContact = function() {
        PelApi.showLoading();
        ApiService.post("PhonebookDetails", appId, {
            p1: personId
          })
          .success(function(data, status, headers, config) {
            var result = ApiService.checkResponse(data, status)

            if (!result.section.match(/no\s+sector/))
              result.has_section = true;
            if (!result.department.match(/no\s+sector/))
              result.has_department = true;
            if (!result.team.match(/no\s+sector/))
              result.has_team = true;
            if (!result.sector.match(/no\s+sector/))
              result.has_sector = true;

            $scope.title = result.firstName + " " + result.lastName;

            $scope.page = 'result';
            $scope.contact = result;
            $scope.tree = $scope.getTreeData(result)

          })
          .error(function(errorStr, httpStatus, headers, config) {
            swal({
              text: "! התרחשה שגיאה" + errorStr,
              type: "error",
              timer: 2000
            });
          })
      }
      $scope.getContact();

    }
  ]);