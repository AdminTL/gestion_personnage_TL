'use strict';

var characterApp = angular.module('creation_personnage_TL', ['ngSanitize', 'ngRoute', 'schemaForm', 'mgcrea.ngStrap', 'ngPrint']);

characterApp.config(['$routeProvider', function ($routeProvider) {
  // $routeProvider.when('/login', {templateUrl: 'templates/login.html', login: true});
  // $routeProvider.when('/signup', {templateUrl: 'templates/signup.html', public: true});
  // $routeProvider.when('/verify-email', {templateUrl: 'partials/verify-email.html', verify_email: true});
  // $routeProvider.when('/reset-password', {templateUrl: 'partials/reset-password.html', public: true});
  // $routeProvider.when('/set-password', {templateUrl: 'partials/set-password.html', set_password: true});
  // $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  // $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/'});
}])
