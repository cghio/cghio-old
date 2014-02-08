var CGH = angular.module('CGH', [ 'ngRoute' ]);

CGH.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/builds', {
    templateUrl: '/builds.html',
    controller: BuildsController
  });
  $routeProvider.when('/help', {
    templateUrl: '/help.html',
    controller: HelpController
  });
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('!');
});

CGH.factory('Builds', function($http) {
  return $http.get('/builds.json');
});

function BuildsController($scope, Builds) {
  $scope.cryptos = [
    {
      key: 'md5sum',
      name: 'MD5',
      active: true
    },
    {
      key: 'shasum',
      name: 'SHA-1',
    }
  ];
  $scope.currentCrypto = function() {
    for (var i = 0; i < $scope.cryptos.length; i++) {
      if ($scope.cryptos[i].active) return $scope.cryptos[i];
    }
    return $scope.cryptos[0];
  };
  Builds.success(function(builds) {
    $scope.builds = builds;
  });
}

CGH.directive('crypto', function() {
  return function(scope, element, attrs) {
    element.bind('click', function() {
      scope.cryptos.forEach(function(crypto) {
        crypto.active = (crypto.key === attrs.crypto);
      });
      scope.$apply();
    });
  };
});

function HelpController() {

}
