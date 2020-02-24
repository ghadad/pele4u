/**
 * Created by User on 04/10/2015.
 */
/*
 * SimplePubSub from https://github.com/mbenford/ngTagsInput/blob/master/src/util.js
 * */
'use strict';

function SimplePubSub() {
  var events = {};
  return {
    on: function(names, handler) {
      names.split(' ').forEach(function(name) {
        if (!events[name]) {
          events[name] = [];
        }
        events[name].push(handler);
      });
      return this;
    },
    trigger: function(name, args) {
      angular.forEach(events[name], function(handler) {
        handler.call(null, args);
      });
      return this;
    }
  };
};

angular.module('tabSlideBox', [])
  .directive('onFinishRender', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function() {
            scope.$emit('ngRepeatFinished');
          });
        }
      }
    }
  })
  .directive('tabSlideBox', ['$timeout', '$window', '$ionicSlideBoxDelegate', '$ionicScrollDelegate',
    function($timeout, $window, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
      'use strict';

      return {
        restrict: 'A, E, C',
        link: function(scope, element, attrs, ngModel) {
          $ionicSlideBoxDelegate.stop()
          var ta = element[0],
            $ta = element;
          $ta.addClass("tabbed-slidebox");
          if (attrs.tabsPosition === "bottom") {
            $ta.addClass("btm");
          }

          //Handle multiple slide/scroll boxes
          var handle = ta.querySelector('.slider').getAttribute('delegate-handle');

          var ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
          if (handle) {
            ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(handle);
          }

          var ionicScrollDelegate = $ionicScrollDelegate;
          if (handle) {
            ionicScrollDelegate = ionicScrollDelegate.$getByHandle(handle);
          }

          function renderScrollableTabs() {
            var iconsDiv = angular.element(ta.querySelector(".tsb-icons")),
              icons = iconsDiv.find("a"),
              wrap = iconsDiv[0].querySelector(".tsb-ic-wrp"),
              totalTabs = icons.length;
            var scrollDiv = wrap.querySelector(".scroll");

            angular.forEach(icons, function(value, key) {
              var a = angular.element(value);
              a.on('click', function() {
                ionicSlideBoxDelegate.slide(key);
              });

              if (a.attr('icon-off')) {
                a.attr("class", a.attr('icon-off'));
              }
            });

            var initialIndex = attrs.tab;
            //Initializing the middle tab
            if (typeof attrs.tab === 'undefined' || (totalTabs <= initialIndex) || initialIndex < 0) {
              initialIndex = Math.floor(icons.length / 2);
            }

            //If initial element is 0, set position of the tab to 0th tab
            if (initialIndex == 0) {
              setPosition(0);
            }

            $timeout(function() {
              ionicSlideBoxDelegate.slide(initialIndex);
            }, 0);
          }

          function setPosition(index) {
            var iconsDiv = angular.element(ta.querySelector(".tsb-icons")),
              icons = iconsDiv.find("a"),
              wrap = iconsDiv[0].querySelector(".tsb-ic-wrp"),
              totalTabs = icons.length;
            var scrollDiv = wrap.querySelector(".scroll");

            var middle = iconsDiv[0].offsetWidth / 2;
            var curEl = angular.element(icons[index]);
            var prvEl = angular.element(iconsDiv[0].querySelector(".active"));
            if (curEl && curEl.length) {
              var curElWidth = curEl[0].offsetWidth,
                curElLeft = curEl[0].offsetLeft;

              if (prvEl.attr('icon-off')) {
                prvEl.attr("class", prvEl.attr('icon-off'));
              } else {
                prvEl.removeClass("active");
              }
              if (curEl.attr('icon-on')) {
                curEl.attr("class", curEl.attr('icon-on'));
              }
              curEl.addClass("active");

              var leftStr = (middle - (curElLeft) - curElWidth / 2 + 5);
              //If tabs are not scrollable
              if (!scrollDiv) {
                var leftStr = (middle - (curElLeft) - curElWidth / 2 + 5) + "px";
                wrap.style.webkitTransform = "translate3d(" + leftStr + ",0,0)";
              } else {
                //If scrollable tabs
                var wrapWidth = wrap.offsetWidth;
                var currentX = Math.abs(getX(scrollDiv.style.webkitTransform));
                var leftOffset = 100;
                var elementOffset = 40;
                //If tabs are reaching right end or left end
                if (((currentX + wrapWidth) < (curElLeft + curElWidth + elementOffset)) || (currentX > (curElLeft - leftOffset))) {
                  if (leftStr > 0) {
                    leftStr = 0;
                  }
                  //Use this scrollTo, so when scrolling tab manually will not flicker

                  ionicScrollDelegate.scrollTo(Math.abs(leftStr), 0, true);
                }
              }
            }
          };

          function getX(matrix) {
            matrix = matrix.replace("translate3d(", "");
            matrix = matrix.replace("translate(", "");
            return (parseInt(matrix));
          }
          var events = scope.events;
          events.on('slideChange', function(data) {
            setPosition(data.index);
          });
          events.on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            renderScrollableTabs();
          });

          renderScrollableTabs();
        },
        controller: function($scope, $attrs, $element) {
          $scope.events = new SimplePubSub();

          $scope.disable = function(event) {
            if (event === "drag") $ionicSlideBoxDelegate.enableSlide(false);

            if (event === "left-right" || event === "right-left") {
              $ionicScrollDelegate.getScrollView().options.scrollingX = true;
              $ionicScrollDelegate.getScrollView().options.scrollingY = false;
            }
            if (event === "up-down" || event === "down-up") {
              $ionicScrollDelegate.getScrollView().options.scrollingX = false;
              $ionicScrollDelegate.getScrollView().options.scrollingY = true;
            }
          }

          $scope.enable = function(event) {
            if (event === "drag") $ionicSlideBoxDelegate.enableSlide(true);
            if (event === "left-right" || event === "right-left") {
              $ionicScrollDelegate.getScrollView().options.scrollingX = true;
              $ionicScrollDelegate.getScrollView().options.scrollingY = false;
            }
            if (event === "up-down" || event === "down-up") {
              $ionicScrollDelegate.getScrollView().options.scrollingX = false;
              $ionicScrollDelegate.getScrollView().options.scrollingY = true;
            }
          }

          $scope.slideHasChanged = function(index) {

            $scope.events.trigger("slideChange", {
              "index": index
            });
            $timeout(function() {
              if ($scope.onSlideMove) $scope.onSlideMove({
                "index": eval(index)
              });
            }, 100);
          };

          $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {

            $scope.events.trigger("ngRepeatFinished", {
              "event": ngRepeatFinishedEvent
            });
          });
        }
      };

    }
  ]).directive("fancySelect", function($ionicModal) {
    return {
      // Only use as <fancy-select> tag
      restrict: "E",

      /* The default template
       * this uses the default "id" and "text" properties
       */
      template: function(element, attrs) {
        if (attrs.templateUrl) {
          return "<ng-include src=\"'" + attrs.templateUrl + "'\"></ng-include>";
        } else {
          return '<ion-list ng-class="listClass"> ' +
            '<ion-item ng-click=showItems($event) class="item-text-wrap"> ' +
            ' <span class="item-note">{{noteText}} <img ng-show="noteImg" class={{noteImgClass}} ng-if="noteImg != null" ng-src="{{noteImg}}"/> </span> ' +
            '<span ng-class="headerClass" ng-bind-html="text"></span>' +
            '</ion-item> </ion-list>';
        }
      },

      // The default attribute set
      scope: {
        items: "=", // Needs to have a value
        value: "=", // Needs to have a value
        valueChangedCallback: "&valueChanged", // The callback used to signal that the value has changed
        getCustomTextCallback: "&getCustomText" // The callback used to get custom text based on the selected value
      },

      // Hook up the directive
      link: function(scope, element, attrs) {
        // Default values
        scope.multiSelect = attrs.multiSelect === 'true' ? true : false;
        scope.allowEmpty = attrs.allowEmpty === 'false' ? false : true;

        // Header used in ion-header-bar
        scope.headerText = attrs.headerText || '';

        // Text displayed on label
        scope.text = attrs.text || '';
        scope.defaultText = attrs.text || '';

        // Data binding properties
        scope.checkedProperty = attrs.checkedProperty || "checked";
        scope.iconProperty = attrs.iconProperty || "icon";
        scope.textProperty = attrs.textProperty || "text";
        scope.valueProperty = attrs.valueProperty || "id";
        scope.listClass = attrs.listClass || "fancy-list";
        scope.itemClass = attrs.itemClass || "fancy-item";
        scope.headerClass = attrs.headerClass || "fancy-header";

        // The modal properties
        scope.modalTemplateUrl = attrs.modalTemplateUrl;
        scope.modalAnimation = attrs.modalAnimation;

        // Note properties
        scope.noteImg = attrs.noteImg || "";
        scope.noteText = attrs.noteText || "";
        scope.noteImgClass = attrs.noteImgClass || "";

        /* Initialise the modal
         * If a modal template URL has been provided, then use that,
         * otherwise use the default one, that uses the
         * "id" and "text" properties
         */
        if (scope.modalTemplateUrl) {
          $ionicModal.fromTemplateUrl(
            scope.modalTemplateUrl, {
              scope: scope,
              animation: scope.modalAnimation
            }
          ).then(function(modal) {
            scope.modal = modal;
          });

        } else {
          scope.modal = $ionicModal.fromTemplate(
            '<ion-modal-view> <ion-header-bar class="bar-positive"> <button class="button button-positive button-icon ion-ios-arrow-back" ng-click="hideItems()"/> <h1 class="title" ng-class="headerClass">{{headerText}}</h1> <button class="button button-positive button-icon ion-checkmark" ng-show="multiSelect" ng-click="validate()"/> </ion-header-bar> <ion-content> <ion-list> <ion-item ng-class="itemClass" class="item-checkbox" ng-if="multiSelect" ng-repeat="item in items"> <label class="checkbox"> <input type="checkbox" ng-checked="item.checked" ng-model="item.checked"> </label>{{item[textProperty]}}</ion-item> <label ng-class="itemClass" class="item" ng-click="validate(item)" ng-if="!multiSelect" ng-repeat="item in items">{{item[textProperty]}}</label> </div></ion-content></ion-modal-view>', {
              scope: scope,
              animation: scope.modalAnimation
            }
          );
        }

        /* When the scope is destroyed, remove the modal */
        scope.$on("$destroy", function() {
          scope.modal.remove();
        });

        scope.getItemText = function(item) {
          return scope.textProperty ? item[scope.textProperty] : item;
        };

        scope.getItemValue = function(item) {
          return scope.valueProperty ? item[scope.valueProperty] : item;
        };

        // Gets the text for the specified values
        scope.getText = function(value) {
          // Push the values into a temporary array so that they can be iterated through
          var temp;
          if (scope.multiSelect) {
            temp = value ? value : []; // In case it hasn't been defined yet
          } else {
            temp = (value === null || (typeof value === "undefined")) ? [] : [value]; // Make sure it's in an array, anything other than null/undefined is ok
          }

          var text = "";
          if (temp.length) {
            // Concatenate the list of "list"ed items
            angular.forEach(scope.items, function(item, key) {
              for (var i = 0; i < temp.length; i++) {
                if (scope.getItemValue(item) == temp[i]) {
                  text += (text.length ? ", " : "") + scope.getItemText(item);
                  break;
                }
              }
            });

          } else {
            // Just use the default text
            text = scope.defaultText;

          }

          // If a callback has been specified for the text
          return scope.getCustomTextCallback({
            value: value
          }) || text;
        };

        // Hides the list
        scope.hideItems = function(event) {
          scope.modal.hide();
        };

        // Raised by watch when the value changes
        scope.onValueChanged = function(newValue, oldValue) {
          scope.text = scope.getText(newValue);

          // Notify subscribers that the value has changed
          scope.valueChangedCallback({
            value: newValue
          });
        };

        // Shows the list
        scope.showItems = function(event) {
          event.preventDefault(); // Prevent the event from bubbling

          // For multi-"list", make sure we have an up-to-date list of checked items
          if (scope.multiSelect) {
            // Clone the list of values, as we'll splice them as we go through to reduce loops
            var values = scope.value ? angular.copy(scope.value) : [];

            angular.forEach(scope.items, function(item, key) {
              // Not checked by default
              item[scope.checkedProperty] = false;

              var val = scope.getItemValue(item);
              for (var i = 0; i < values.length; i++) {
                if (val === values[i]) {
                  item[scope.checkedProperty] = true;
                  values.splice(i, 0); // Remove it from the temporary list
                  break;
                }
              }
            });
          }

          scope.modal.show();
        };

        // Validates the current list
        scope.validate = function(item) {
          if (scope.multiSelect) {
            // Need to scan the list for selected items and push them into the value list
            scope.value = [];

            if (scope.items) {
              angular.forEach(scope.items, function(item, key) {
                if (item[scope.checkedProperty]) {
                  scope.value[scope.value.length] = scope.getItemValue(item);
                }
              });
            }

          } else {
            // Just use the current item
            scope.value = scope.getItemValue(item);

          }

          scope.hideItems();
        };

        // Watch the value property, as this is used to build the text
        scope.$watch(function() {
          return scope.value;
        }, scope.onValueChanged, true);
      }
    };
  }).directive('bindHtmlCompile', ['$compile', function($compile) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$watch(function() {
          return scope.$eval(attrs.bindHtmlCompile);
        }, function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        });
      }
    };
  }]).directive('dateInput', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModelCtrl) {
        //Angular 1.3 insert a formater that force to set model to date object, otherwise throw exception.
        //Reset default angular formatters/parsers
        ngModelCtrl.$formatters.length = 0;
        ngModelCtrl.$parsers.length = 0;
      }
    };
  }).directive('focusMe', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        console.log(element[0])
        $timeout(function() {
     
          element[0].focus(); 
        });
      }
    };
  }); 
  