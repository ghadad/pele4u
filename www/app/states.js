angular.module('pele.states', [])
  .constant('appStates', [{
      state: "app.dev",
      url: '/dev',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/dev/devmenu.html';
          },
          controller: 'AppCtrl',
        }
      }
    }, {
      state: "app.dev.log",
      url: '/log',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/dev/log.html';
          },
          controller: 'devCtrl',
        }
      },
      src: ["app/apps/dev/devCtrl.js"]
    }, {
      state: "app.ldap_login",
      url: '/ldap_login',
      params: {
        reset: null,
      },
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'templates/auth/ldap_login.html';
          },
          controller: 'LdapLoginCtrl'
        }
      },
      src: ["app/LdapLoginCtrl.js"]
    },{
      state: "app.dev.network",
      url: '/log',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/dev/network.html';
          },
          controller: function($scope, $cordovaNetwork, $interval) {
            $interval(function() {
              $scope.network = $cordovaNetwork.getNetwork();
              $scope.isOnline = $cordovaNetwork.isOnline();
              $scope.date = new Date();
            }, 200)
          },
        }
      },
      src: ["app/apps/dev/devCtrl.js"]
    }, {
      state: "app.dev.errors",
      url: '/errors',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/dev/errors.html';
          },
          controller: 'devCtrl',
        }
      },
      src: ["app/apps/dev/devCtrl.js"]
    }, {
      state: "app.dev.attach",
      url: '/attach',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/dev/attach.html';
          },
          controller: 'devCtrl',
        }
      },
      src: ["app/apps/dev/devCtrl.js"]
    }, {
      state: "app.p2_moduleList",
      url: '/p2_moduleList/:AppId/:Title/:Pin',
      views: {
        'menuContent': {
          templateUrl: function() {
            return 'app/apps/docApprove/p2_moduleList.html';
          },
          controller: 'P2_moduleListCtrl',
        }
      },
      src: ["app/apps/docApprove/P2_moduleListCtrl.js"]
    }, {
      state: 'app.p3_rq_moduleDocList',
      url: "/p3_rq_moduleDocList/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/RQ/p3_rq_moduleDocList.html";
          },
          controller: 'p3_rq_moduleDocListCtrl'
        }
      },
      src: ["app/apps/docApprove/RQ/p3_rq_moduleDocListCtrl.js"]
    }, {
      state: 'app.p3_po_moduleDocList',
      url: "/p3_po_moduleDocList/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/PO/p3_po_moduleDocList.html";
          },
          controller: 'p3_po_moduleDocListCtrl'
        }
      },
      src: ["app/apps/docApprove/PO/p3_po_moduleDocListCtrl.js"]
    }, {
      state: 'app.p3_hr_moduleDocList',
      url: "/p3_hr_moduleDocList/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/HR/p3_moduleDocList.html";
          },
          controller: 'p3_hr_moduleDocListCtrl'
        }
      },
      src: ["app/apps/docApprove/HR/p3_hr_moduleDocListCtrl.js"]
    }, {
      state: 'app.tsk_list',
      url: "/task_list/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/TSK/tskList.html";
          },
          controller: 'tskListCtrl',

        }
      },
      src: ["app/apps/docApprove/TSK/tskListCtrl.js"]
    }, {
      state: 'app.tsk_details',
      url: "/task_details/:formType/:AppId/:docId/:docInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/TSK/tskDetails.html";
          },
          controller: 'tskDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/TSK/tskDetailsCtrl.js"]
    }, {
      state: 'app.inv_list',
      url: "/inv_list/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/INV/invList.html";
          },
          controller: 'invListCtrl',
        }
      },
      src: ["app/apps/docApprove/INV/invListCtrl.js"]
    }, {
      state: 'app.inv_details',
      url: "/inv_details/:formType/:AppId/:docId/:docInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/INV/invDetails.html";
          },
          controller: 'invDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/INV/invDetailsCtrl.js"]
    }, {
      state: 'app.pay_list',
      url: "/pay_list/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/PAY/payList.html";
          },
          controller: 'payListCtrl',
        }
      },
      src: ["app/apps/docApprove/PAY/payListCtrl.js"]
    }, {
      state: 'app.pay_details',
      url: "/pay_details/:formType/:AppId/:docId/:docInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/PAY/payDetails.html";
          },
          controller: 'payDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/PAY/payDetailsCtrl.js"]
    }, {      
      state: 'app.chat_list',
      url: "/chat_list/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/CHAT/chatList.html";
          },
          controller: 'chatListCtrl',
        }
      },
      src: ["app/apps/docApprove/CHAT/chatListCtrl.js"]
    }, {
      state: 'app.chat_details',
      url: "/chat_details/:formType/:AppId/:docId/:docInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/CHAT/chatDetails.html";
          },
          controller: 'chatDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/CHAT/chatDetailsCtrl.js"]
    }, {
      state: 'app.chat_po_details',
      url: "/chat_details",
      params: {
        obj: null
      },
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/CHAT/chatPoDetails.html";
          },
          controller: 'chatPoDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/CHAT/chatPoDetailsCtrl.js"]
    }, {
      state: 'app.open_chat',
      url: "/open_chat",
      params: {
        obj: null
      },
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/CHAT/openChat.html";
          },
          controller: 'openChatCtrl'
        }
      },
      src: ["app/apps/docApprove/CHAT/openChatCtrl.js"]
    }, {
      state: 'app.ini_list',
      url: "/ini_list/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/INI/iniList.html";
          },
          controller: 'iniListCtrl'
        }
      },
      src: ["app/apps/docApprove/INI/iniListCtrl.js"]
    }, {
      state: 'app.ini_details',
      url: "/ini_details/:formType/:AppId/:docId/:docInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/INI/iniDetails.html";
          },
          controller: 'iniDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/INI/iniDetailsCtrl.js"]
    }, {
      state: 'app.travel_list',
      url: "/travel_list/:AppId/:FormType/:Pin",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/TRAVEL/travelList.html";
          },
          controller: 'travelListCtrl'
        }
      },
      src: ["app/apps/docApprove/TRAVEL/travelListCtrl.js"]
    }, {
      state: 'app.travel_details',
      url: "/travel_details/:formType/:AppId/:docId/:docInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/TRAVEL/travelDetails.html";
          },
          controller: 'travelDetailsCtrl'
        }
      },
      src: ["app/apps/docApprove/TRAVEL/travelDetailsCtrl.js"]
    }, {
      state: 'app.doc_10002',
      url: "/doc_10002/:AppId/:DocId/:DocInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/PO/p4_po_doc_10002.html";
          },
          controller: 'p4_po_doc_10002Ctrl'
        }
      },
      src: ["app/apps/docApprove/PO/p4_po_doc_10002Ctrl.js"]
    }, {
      state: 'app.doc_242',
      url: "/doc_242/:AppId/:DocId/:DocInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/HR/p4_doc_242.html";
          },
          controller: 'p4_hr_docCtrl'
        }
      },
      src: ["app/apps/docApprove/HR/p4_hr_docCtrl.js"]
    }, {
      state: 'app.doc_806',
      url: "/doc_806/:AppId/:DocId/:DocInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/HR/p4_doc_806.html";
          },
          controller: 'p4_hr_docCtrl'
        }
      },
      src: ["app/apps/docApprove/HR/p4_hr_docCtrl.js"]
    }, {
      state: 'app.doc_807',
      url: "/doc_807/:AppId/:DocId/:DocInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/HR/p4_doc_807.html";
          },
          controller: 'p4_hr_docCtrl'
        }
      },
      src: ["app/apps/docApprove/HR/p4_hr_docCtrl.js"]
    }, {
      state: 'app.doc_20002',
      url: "/doc_20002/:AppId/:DocId/:DocInitId",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/RQ/p4_rq_doc_20002.html";
          },
          controller: 'p4_rq_doc_20002Ctrl'
        }
      },
      src: ["app/apps/docApprove/RQ/p4_rq_doc_20002Ctrl.js"]

    }, {
      state: 'app.doc_30002',
      url: "/doc_30002/:AppId/:IniDocId/:IniDocInitId/:DocId/:Mode",
      views: {
        'menuContent': {
          templateUrl: function() {
            return "app/apps/docApprove/INI/p4_ini_doc_30002.html";
          },
          controller: 'p4_ini_doc_30002Ctrl'
        }
      },
      src: ["app/apps/docApprove/INI/p4_ini_doc_30002Ctrl.js"]
    }, {
      state: "app.phonebook",
      url: '/phonebook/:AppId/:reload',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: function() {
            return 'app/apps/phonebook/list.html';
          },
          controller: 'phonebookListCtrl',
        }
      },
      src: ["app/apps/phonebook/listCtrl.js"]
    }, {
      state: "app.phonebook.details",
      url: '/:personId',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/phonebook/details.html';
          },
          controller: 'phonebookDetailsCtrl',
        }
      },
      src: ["app/apps/phonebook/detailsCtrl.js"]
    }, {
      state: 'app.p2_scan_print',
      url: '/scan_print',
      views: {
        'menuContent': {
          templateUrl: function() {
            return 'app/apps/scanPrint/p2_scan_print.html';
          },
          controller: 'p2_scan_printCtrl'
        }
      },
      src: ["app/apps/scanPrint/p2_scan_printCtrl.js"]
    }, {
      state: 'app.leads.all',
      url: '/leads/:Title/',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/leads/menu.html';
          },
          controller: 'menuCtrl',
        }
      },
      src: [
        "app/apps/leads/menuCtrl.js"
      ]
    }, {
      state: 'app.leads',
      url: '/leads/:Title/',
      abstract: true,
    }, {
      state: 'app.leads.task',
      url: '/leads/:Title/',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/leads/menu.html';
          },
          controller: 'menuCtrl',
        }
      },
      src: [
        "app/apps/leads/menuCtrl.js"
      ]
    },
    {
      state: 'app.leads.self',
      url: '/leads/:Title/',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/leads/menu.html';
          },
          controller: 'menuCtrl',
        }
      },
      src: [
        "app/apps/leads/menuCtrl.js"
      ]
    }, {
      state: 'app.leads.lead',
      url: '/lead/:type/:Title/',
      params: {
        lead: {},
        task: {}
      },
      views: {
        'menuContent@app': {
          templateUrl: function($stateParams) {
            if ($stateParams.task && $stateParams.task.TASK_NUMBER)
              return 'app/apps/leads/task.html';
            return 'app/apps/leads/lead.html';
          },
          controller: 'leadCtrl'
        }
      },
      src: [
        "lib/angular-sanitize.min.js",
        "app/apps/leads/leadCtrl.js"
      ]
    },
    {
      state: 'app.leads.report',
      url: '/report/:type/:Title/',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/leads/report.html';
          },
          controller: 'leadsReportsCtrl'
        }
      },
      src: ["app/apps/leads/reportCtrl.js"]
    },
    {
      state: 'app.cc',
      url: '/ccApp',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/cc/ccMain.html';
          },
          controller: 'ccMainCtrl'
        }
      },
      src: ["app/apps/cc/ccMain.js"]
    },
    {
      state: 'app.cc.getenv',
      url: '/ccApp',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/cc/ccMain.html';
          },
          controller: 'ccMainCtrl'
        }
      },
      src: ["app/apps/cc/ccMain.js"]
    },
    {
      state: 'app.cc.packagelist',
      url: '/packagelist/:env/:timestamp?',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/cc/packagelist.html';
          },
          controller: 'packageListCtrl'
        }
      },
      src: ["app/apps/cc/packageListCtrl.js"]
    },
    {
      state: 'app.cc.packagedetails',
      url: '/packagedetails/:pkg/:stat/:env',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/cc/packagedetails.html';
          },
          controller: 'packagedetailsCtrl'
        }
      },
      src: ["app/apps/cc/packagedetailsCtrl.js"]
    },{
      state: 'app.busLeads',
      url: '/busLeads',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/busLeads/menu.html';
          },
          controller: 'busMenuCtrl'
        }
      },
      src: ["app/apps/busLeads/menuCtrl.js"]
    },
    {
      state: 'app.busLeads.menu',
      url: '/busLeads',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/busLeads/menu.html';
          },
          controller: 'busMenuCtrl',
        }
      },
      src: [
        "app/apps/busLeads/menuCtrl.js"
      ]
    },
    {
      state: 'app.busLeads.lead',
      url: '/busLeads/:type/:Title/',
      params: {
        lead: {},
        task: {}
      },
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/busLeads/lead.html';
          },
          controller: 'busLeadCtrl'
        }
      },
      src: [
        "lib/angular-sanitize.min.js",
        "app/apps/busLeads/leadCtrl.js"
      ]
    },
    {
      state: 'app.busLeads.report',
      url: '/report/:type/:Title/',
      views: {
        'menuContent@app': {
          templateUrl: function() {
            return 'app/apps/busLeads/report.html';
          },
          controller: 'leadsReportsCtrl'
        }
      },
      src: ["app/apps/busLeads/reportCtrl.js"]
    },
  ]);
