/**
 * Created by User on 12/12/2016.
 */
angular.module('pele')
  .controller('p2_scan_printCtrl', function($scope, $stateParams, $cordovaBarcodeScanner, $ionicLoading, $ionicPopup, $localStorage, $ionicModal, PelApi) {
    $scope.modal = $ionicModal.fromTemplate('<ion-modal-view>' +
      '<ion-header-bar class="bar bar-header bar-positive">' +
      '  <h1 class = "title"> שחרור הדפסה</h1>' +

      '     </ion-header-bar>' +

      '<ion-content >' +
      '<div class="padding" dir="RTL">' +
      '<center>' +
      '         <h4 style="color:red;">  שים לב!! </h4>' +
      '       </center>' +
      '      <h4>' +
      '     <BR>' +

      'ניתן לבצע הדפסות רק אם הן נשלחו למדפסת BW.' +
      '<BR>בכדי לבצע את ההדפסה' + '<BR>' +
      'יש לגשת אל מדפסת שבה רוצים להדפיס' +
      '<br>ולסרוק את קוד ה- QR שצמוד למדפסת.' +
      '<br>' +
      '<br>' +

      '<center>' +
      '         <img  src="img/qrcode.jpg"/>' +
      '</center>' +
      '<br>' +

      '</div>' +



      '<button class = "button  button-full button-positive "  ng-click = "closeModal()">אישור</button>' +
      '<button class = "button button-full button-stable"  ng-click = "closeModalIgnore()">הבנתי</button>' +



      '</ion-content>' +

      '</ion-modal-view>', {
        scope: $scope,
        animation: 'slide-in-up'
      })

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.doRefresh();
    };

    $scope.closeModalIgnore = function() {
      window.localStorage.setItem("barcodetip", "0");
      $scope.modal.hide();
      $scope.doRefresh();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
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


    $scope.doSomething = function() {





      //
      if (window.localStorage.getItem("barcodetip") === null) {
        $scope.openModal();
      } else {

        $scope.doRefresh();

      }

    };

    //-----------------------------------------//
    //--         scanBarcode
    //-----------------------------------------//
    $scope.doRefresh = function() {

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

      PelApi.lagger.info("IN p2_scan_printCtrl.scanBarcode();");
      if (window.cordova != undefined) {
        cordova.plugins.barcodeScanner.scan(function(imageData) {

          if (!imageData.cancelled) {

            var printUrl = imageData.text;

            var patt = new RegExp(PelApi.appSettings.config.MSSO_PRINT_URL);
            var res = patt.test(printUrl);
            if (res) {
              var sendScanPrint = PelApi.sendScanPrint(printUrl)

              sendScanPrint.then(
                //----------------//
                //--   SUCCESS  --//
                //----------------//
                function() {
                  sendScanPrint.success(function(data, status, headers, config) {
                    PelApi.goHome();
                  });
                }
                //----------------//
                //--   ERROR  --//
                //----------------//
                ,
                function(response) {
                  console.log("ERROR_1 p2_scan_printCtrl.scanBarcode() :" + JSON.stringify(response));
                  PelApi.lagger.error(" 1 . p2_scan_printCtrl.scanBarcode() - " + JSON.stringify(response));
                  PelApi.showPopup(PelApi.appSettings.config.interfaceErrorTitle, "");
                  PelApi.goHome();

                }
              );
            } else {
              PelApi.showPopup(PelApi.appSettings.config.MSSO_PRINT_WRONG_BARCODE, "");
            }

          } else {
            PelApi.goHome();
          }
        }, function(error) {

          console.log("ERROR_2 An error happened -> " + error);
          PelApi.lagger.error(" 2 . p2_scan_printCtrl.scanBarcode() - " + JSON.stringify(error));
          PelApi.showPopup(PelApi.appSettings.config.SCAN_PRINT_SCANNING_ERROR, "");
          PelApi.goHome();
        });
      }
    };


  }); // p2_scan_printCtrl
