var CGH = angular.module('CGH', [ 'ngRoute', 'ngSanitize' ]);

CGH.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/builds', {
    templateUrl: '/builds.html',
    controller: BuildsController
  });
  $routeProvider.when('/help/:help_topic?', {
    templateUrl: '/help.html',
    controller: HelpController
  });
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('!');
});

CGH.filter('markdown', function() {
  return function(content) {
    if (!content) return '';
    if (content instanceof Array) content = content.join('\n');
    content = content.replace(/^---(.|\n)*---\n/, '');
    return markdown.toHTML(content, 'Maruku');
  };
});

CGH.directive('navbarLink', function($location) {
  return function(scope, element, attrs) {
    scope.$on('$routeChangeSuccess', function(event, current, previous) {
      var links = element.find('a');
      if (links.length === 0) return;
      var href = links[0].getAttribute('href').replace(/^\/#!?/, '');
      var url = $location.url();
      if (url.substr(0, href.length) === href) {
        element.addClass('active');
      } else {
        element.removeClass('active');
      }
    });
  };
});

CGH.factory('Builds', function($http) {
  return $http.get('/builds.json');
});

CGH.factory('Helps', function($http) {
  return $http.get('/help.json');
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

function HelpController($scope, Helps, $routeParams, $http) {
  var help_topic = $routeParams.help_topic;
  Helps.success(function(helps) {
    $scope.helps = helps;
  });
  if (help_topic) {
    $http.get('/help/' + help_topic + '.json').success(function(help_topic) {
      $scope.help_topic = help_topic;
    });
  }
}
