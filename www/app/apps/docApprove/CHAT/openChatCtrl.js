angular.module('pele')
    .controller('openChatCtrl', ['$scope', 'ApiService', 'StorageService', '$stateParams', '$ionicScrollDelegate', '$ionicLoading', '$state', 'PelApi', '$ionicModal', '$ionicHistory', '$ionicNavBarDelegate',
        function ($scope, ApiService, StorageService, $stateParams, $ionicScrollDelegate, $ionicLoading, $state, PelApi, $ionicModal, $ionicHistory, $ionicNavBarDelegate) {

            $scope.$on('$ionicView.beforeEnter', function () {
                if (!$ionicHistory.viewHistory().forwardView) {
                    $scope.formData = {
                        forwardUserNameSr: "",
                        forwardUserNameSr: [{
                            "key": "",
                            "value": ""
                        }]
                    };
                    $scope.setForm()
                }
            });

            $scope.docDetails = $stateParams.obj;
            $scope.title = 'פתיחת ביאור';
            /* if (!$scope.formData.subject){
                $scope.noteSubject = $scope.docDetails.NOTE_SUBJECT || [];
            } */
            $scope.noteSubject = $scope.docDetails.NOTE_SUBJECT || [];
            $scope.forwardUsers = $scope.docDetails.NOTE_SHORT_LIST || [];
            $scope.buttonsArr = $scope.docDetails.NOTE_SEND_BUTTON || [];
            $scope.actionNote = {};
            $scope.forwardUserNameTemp = "";

            $scope.formData = {
                subject: "",
                forwardUserName: "",
                forwardUserNameSr: [{
                    "key": "",
                    "value": ""
                }]
            }

            $scope.page = "form"
            $scope.searchResult = {
                cursor: {},
                list: []
            }

            $scope.options = {
                loop: false,
                effect: 'fade',
                speed: 500,
                pagination: false,
                direction: 'vertical'
            }

            console.log($scope.formData.subject);

            $scope.setForm = function (removeUser) {
                $ionicNavBarDelegate.showBackButton(true);
                $scope.page = "form"
                $scope.searchResult = {
                    cursor: {},
                    list: []
                };
                if (!removeUser) {
                    $scope.formData.forwardUserNameSr = [{
                        "key": "",
                        "value": ""
                    }];
                }
            }

            $scope.search = function (type) {
                var cursor = _.get($scope.searchResult, "cursor", {});
                var quantity = cursor.quantity || 0;
                var offset = cursor.offset || null;
                var checkTerm = $scope.formData.forwardUserNameSr[0].value.replace(/\s/g, '')

                if (checkTerm.length < 2) {
                    $scope.hint = "יש להזין לפחות שתי אותיות";
                    return false;
                } else {
                    $scope.hint = "";
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
                $scope.title = "תוצאות חיפוש"
                let termParams = $scope.formData.forwardUserNameSr[0].value.replace(/^\s+/, '').split(/\s+/);
                let p1 = termParams[0];
                let p6 = termParams[1];

                ApiService.post("AllEmployeesSearch", $scope.docDetails.appId, {
                        p1: p1,
                        p3: offset,
                        p6: p6
                    })
                    .success(function (data, status, headers, config) {
                        var result = ApiService.checkResponse(data, status, config)
                        $scope.searchResult.cursor = result.cursor;
                        $scope.searchResult.list = _.concat($scope.searchResult.list, result.list);
                        $scope.searchResult.isFound = result.list.length ? true : false;
                        $scope.page = 'result';
                        $ionicNavBarDelegate.showBackButton(false);

                        if (result.cursor.offset < 30) {
                            $ionicScrollDelegate.scrollTop();
                        }

                        if (data.list && !result.list.length) {
                            $scope.page = 'form';
                            $ionicNavBarDelegate.showBackButton(true);
                        }
                    })
                    .error(function (errorStr, httpStatus, headers, config) {
                        ApiService.checkResponse({
                            error: errorStr
                        }, httpStatus, config);

                    })
            };

            $scope.shoose = function (person) {
                $scope.formData.forwardUserNameSr[0].value = person.LAST_NAME + ', ' + person.FIRST_NAME;
                $scope.formData.forwardUserNameSr[0].key = person.LOGIN;
                $scope.setForm(1);
            };

            $scope.updateDoc = function (btn) {
                if (btn.note) {
                    PelApi.displayNotePopupChatQues($scope, btn)
                } else {
                    $scope.submitUpdateInfo(btn, $scope.actionNote.text);
                }
            };

            $scope.submitUpdateInfo = function (btn, note) {

                let forwardUser = $scope.formData.forwardUserName || $scope.formData.forwardUserNameSr[0].key;

                PelApi.showLoading();
                
                ApiService.post("SendChat", $scope.docDetails.appId, {
                    p1: $scope.docDetails.RECIPIENT_ROLE,
                    p2: forwardUser,
                    p3: 'PO',
                    p4: $scope.formData.subject,
                    p5: note,
                    p6: $scope.docDetails.PO_HEADER_ID
                })
                .success(function (data, status, headers, config) {
                    var result = ApiService.checkResponse(data, status, config)
                    $ionicHistory.goBack();
                })
                .error(function(errorStr, httpStatus, headers, config) {
                    ApiService.checkResponse({
                      error: errorStr
                    }, httpStatus, config);
                    
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                });

            };

            $scope.displayNotePopupChatQues = function () {
                PelApi.displayNotePopupChatQues($scope);
            }

            $scope.showBtnActions = function () {

                if (!$scope.formData.subject) {
                    $scope.hint = "יש להזין שדה - סיבת ביאור";
                    return false;
                } else if (!$scope.formData.forwardUserNameSr[0].key && !$scope.formData.forwardUserName) {
                    $scope.hint = "יש להזין אחד מהשדות הנעמן";
                    return false;
                } else {
                    $scope.hint = "";
                    PelApi.showBtnActions($scope, $scope.buttonsArr);
                }
            };

        }
    ]);