var CGH = angular.module('CGH', [ 'ngRoute', 'ngSanitize' ]);

CGH.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'main.html',
    controller: MainController
  });
  $routeProvider.when('/builds', {
    title: 'Builds',
    templateUrl: 'builds.html',
    controller: BuildsController
  });
  $routeProvider.when('/links', {
    title: 'Links',
    templateUrl: 'links.html',
    controller: LinksController
  });
  $routeProvider.when('/help/:help_topic?', {
    title: 'Help',
    templateUrl: 'help.html',
    controller: HelpController
  });
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('!');
});

CGH.run(function($location, $rootScope) {
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    $rootScope.title = current.$$route.title;
  });
});

CGH.directive('body', function($rootScope) {
  return {
    restrict: 'E',
    templateUrl: 'index.html'
  };
});

CGH.directive('title', function($rootScope) {
  return {
    restrict: 'E',
    template: '{{(title ? title + " &mdash; " : "") + "cgh.io"}}',
  };
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

CGH.factory('Repositories', function($http) {
  return $http.get('/api/repositories.json');
});

function MainController($scope, Repositories) {
  Repositories.then(function(response) {
    var repositories = response.data;
    $scope.repositories = repositories;
  });
}

CGH.factory('Builds', function($http) {
  return $http.get('/api/builds.json');
});

CGH.factory('Links', function($http) {
  var COLUMNS = 3;
  return $http.get('/api/links.json').then(function(response) {
    var links = response.data;
    if (typeof links !== 'object') return links;

    var links_keys = Object.keys(links);
    var length = links_keys.length;
    var floor = Math.floor(length / COLUMNS);
    var ceil = Math.ceil(length / COLUMNS);
    var mod = length % COLUMNS;
    var count = 0;

    var new_links = [];
    for (var i = 0; i < COLUMNS; i++) {
      new_links[i] = new_links[i] || [];
      var ceil_or_floor = ceil;
      if (i >= mod) ceil_or_floor = floor;
      for (var j = 0; j < ceil_or_floor; j++) {
        var name = links_keys[count];
        new_links[i][name] = links[name];
        count++;
      }
    }
    return new_links;
  });
});

CGH.factory('Helps', function($http) {
  return $http.get('/api/help.json');
});

CGH.service('HelpTopics', function($http) {
  var self = this;
  self.number_of_objects = 10;
  self.help_topics = [];
  self.help_topic_objs = [];
  self.get = function(help_topic, callback) {
    var index = self.help_topics.indexOf(help_topic);
    if (index === -1) {
      $http.get('/api/help/' + help_topic + '.json').success(function(help_topic) {
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
  $scope.targets = [
    {
      name: 'the same',
      target: '_self'
    },
    {
      name: 'new',
      target: '_blank',
      active: true
    }
  ];
  $scope.target = function() {
    for (var i = 0; i < $scope.targets.length; i++) {
      if ($scope.targets[i].active) return $scope.targets[i];
    }
    return $scope.targets[0];
  };
  $scope.keys = function(obj) {
    return Object.keys(obj).filter(function(key) {
      return key[0] !== '$';
    });
  };

  Links.then(function(links) {
    $scope.links = links;
  });
}

CGH.directive('linkTarget', function() {
  return function(scope, element, attrs) {
    element.bind('click', function() {
      scope.targets.forEach(function(target) {
        target.active = (target.target === attrs.linkTarget);
      });
      scope.$apply();
    });
  };
});

function HelpController($scope, Helps, HelpTopics, $routeParams, $rootScope) {
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
      $rootScope.title = help_topic.title;
    });
  }
}
