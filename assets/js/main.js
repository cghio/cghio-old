var CGH = angular.module('CGH', [ 'ngRoute', 'ngSanitize' ]);

CGH.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/builds', {
    templateUrl: '/builds.html',
    controller: BuildsController
  });
  $routeProvider.when('/links', {
    templateUrl: '/links.html',
    controller: LinksController
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

CGH.factory('Links', function($http) {
  return $http.get('/links.json');
});

CGH.factory('Helps', function($http) {
  return $http.get('/help.json');
});

CGH.service('HelpTopics', function($http) {
  var self = this;
  self.number_of_objects = 10;
  self.help_topics = [];
  self.help_topic_objs = [];
  self.get = function(help_topic, callback) {
    var index = self.help_topics.indexOf(help_topic);
    if (index === -1) {
      $http.get('/help/' + help_topic + '.json').success(function(help_topic) {
        self.help_topics.unshift(help_topic.slug);
        self.help_topic_objs.unshift(help_topic);
        self.help_topics.splice(self.number_of_objects);
        self.help_topic_objs.splice(self.number_of_objects);
        if (callback) callback(help_topic);
      });
    } else {
      if (callback) callback(self.help_topic_objs[index]);
    }
  };
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

function LinksController($scope, Links) {
  $scope.keys = function(obj) {
    return Object.keys(obj).filter(function(key) {
      return key[0] !== '$';
    });
  };

  Links.success(function(links) {
    $scope.links = links;
  });
}

function HelpController($scope, Helps, HelpTopics, $routeParams) {
  var help_topic = $routeParams.help_topic;

  // this variable determines whether to show the index page
  // and prevents to show index page if help topic is loading
  $scope.help_topic = help_topic;

  Helps.success(function(helps) {
    $scope.helps = helps;
  });

  if (help_topic) {
    HelpTopics.get(help_topic, function(help_topic) {
      $scope.help_topic = help_topic;
    });
  }
}
