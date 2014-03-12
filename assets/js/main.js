var CGH = angular.module('CGH', [ 'ngRoute', 'ngSanitize' ]).

config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'main',
    controller: 'MainController'
  });
  $routeProvider.when('/builds', {
    title: 'Builds',
    templateUrl: 'builds',
    controller: 'BuildsController'
  });
  $routeProvider.when('/sites', {
    title: 'Sites',
    templateUrl: 'sites',
    controller: 'SitesController'
  });
  $routeProvider.when('/panoramas', {
    title: 'Panoramas',
    templateUrl: 'panoramas',
    controller: 'PanoramasController'
  });
  $routeProvider.when('/links', {
    title: 'Links',
    templateUrl: 'links',
    controller: 'LinksController'
  });
  $routeProvider.when('/help/:help_topic?', {
    title: 'Help',
    templateUrl: 'help',
    controller: 'HelpController'
  });
  $routeProvider.when('/about', {
    title: 'About',
    templateUrl: 'about',
    controller: 'LinksController'
  });
  $routeProvider.otherwise({
    title: '404 Page Not Found',
    templateUrl: '_404'
  });
  $locationProvider.html5Mode(true);
}]).

run(['$location', '$rootScope', '$route',
  function($location, $rootScope, $route) {
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    var route = current.$$route || $route.routes[null];
    $rootScope.title = route.title;
  });
}]).

/* directives */

directive('body', [function() {
  return {
    restrict: 'E',
    templateUrl: 'index'
  };
}]).

directive('title', [function() {
  return {
    restrict: 'E',
    template: '{{(title ? title + " &mdash; " : "") + "cgh.io"}}',
  };
}]).

directive('navbarToggle', function(){
  return {
    restrict: 'C',
    link: function($scope, element, attrs, controller) {
      element.on('click', function() {
        var navbar = document.getElementById(attrs.navbarId);
        if (navbar.className.indexOf('collapse') === -1) {
          navbar.className = navbar.className.replace(/\bin\b/g, 'collapse');
        } else {
          navbar.className = navbar.className.replace(/\bcollapse\b/g, 'in');
        }
      });
    }
  };
}).

directive('nav', ['$location', function($location) {
  return {
    restrict: 'E',
    link: function($scope, element, attrs, controller) {
      element.find('a').on('click', function() {
        var navbar = document.getElementById(attrs.navbarId);
        navbar.className = navbar.className.replace(/\bin\b/g, 'collapse');
      });
      var links = angular.element(element).find('a');
      var length = links.length;
      document.onkeypress = function(event) {
        var key = typeof event.which === 'number' ? 'which' : 'keyCode';
        var left = event[key] === 91;
        var right = event[key] === 93;
        if (!left && !right) return;

        if (!length) return;
        var url = $location.url();
        for (var i = 0; i < length; i++) {
          var href = links[i].getAttribute('href');
          if (href.length > 1) {
            if (url.substr(0, href.length) !== href) continue;
          } else {
            if (url !== href) continue;
          }
          break;
        }

        var next;
        if (left) next = links[--i] || links[length - 1];
        if (right) next = links[++i] || links[0];
        if (next) {
          $location.path(next.getAttribute('href'));
          $scope.$apply();
        }
      };
    }
  };
}]).

directive('removeUnless', function() {
  return function(scope, element, attrs) {
    scope.$watch(attrs.removeUnless, function(value) {
      if (!value) {
        element.replaceWith(element.children());
      }
    });
  }
}).

directive('navbarLink', ['$location', function($location) {
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
}]).

directive('crypto', function() {
  return function(scope, element, attrs) {
    element.bind('click', function() {
      scope.cryptos.forEach(function(crypto) {
        crypto.active = (crypto.key === attrs.crypto);
      });
      scope.$apply();
    });
  };
}).

directive('linkTarget', function() {
  return function(scope, element, attrs) {
    element.bind('click', function() {
      scope.targets.forEach(function(target) {
        target.active = (target.target === attrs.linkTarget);
      });
      scope.$apply();
    });
  };
}).

/* filters */

filter('markdown', function() {
  return function(content) {
    if (!content) return '';
    if (content instanceof Array) content = content.join('\n');
    content = content.replace(/^---(.|\n)*---\n/, '');
    return markdown.toHTML(content, 'Maruku');
  };
}).

filter('buttonify', function() {
  return function(content) {
    var glyphicon = content.match(/^\.(glyphicon-[\S]*)(.*)/);
    if (glyphicon) {
      return '<span class="glyphicon ' + glyphicon[1] + '"></span>' +
        (glyphicon[2] ? ' ' + glyphicon[2] : '');
    } else {
      return content;
    }
  };
}).

/* factories */

factory('Repositories', ['$http', function($http) {
  return $http.get('/api/repositories.json');
}]).

factory('Builds', ['$http', function($http) {
  return $http.get('/api/builds.json');
}]).

factory('Sites', ['$http', function($http) {
  return $http.get('/api/sites.json');
}]).

factory('Panoramas', ['$http', function($http) {
  return $http.get('/api/panoramas.json');
}]).

factory('Links', ['$http', function($http) {
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
}]).

factory('Helps', ['$http', function($http) {
  return $http.get('/api/help.json');
}]).

service('HelpTopics', ['$http', function($http) {
  var self = this;
  self.number_of_objects = 10;
  self.help_topics = [];
  self.help_topic_objs = [];
  self.get = function(help_topic, callback) {
    var index = self.help_topics.indexOf(help_topic);
    if (index === -1) {
      $http.get('/api/help/' + help_topic + '.json')
        .success(function(help_topic) {
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
}]).

service('SharedMethods', [function() {
  this.keys = function get_object_keys(obj) {
    if (typeof(obj) !== 'object') return null;
    return Object.keys(obj).filter(function(key) {
      return key[0] !== '$';
    });
  };
  this.split = function split_lines(content) {
    if (typeof content !== 'string' || !content) return '';
    return content.replace(/\\n/g, '\n').split(/\n{2,}/);
  };
  this.target = function target_on_url(url) {
    return /^https?:\/\//.test(url) ? '_blank' : '_self';
  };
}]).

/* controllers */

controller('MainController', ['$scope', 'Repositories', 'SharedMethods',
  function($scope, Repositories, SharedMethods) {
  angular.extend($scope, SharedMethods);
  Repositories.then(function(response) {
    $scope.items = response.data;
  });
}]).

controller('BuildsController', ['$scope', 'Builds',
  function($scope, Builds) {
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
}]).

controller('SitesController', ['$scope', 'Sites', 'SharedMethods',
  function($scope, Sites, SharedMethods) {
  angular.extend($scope, SharedMethods);
  Sites.then(function(response) {
    $scope.items = response.data;
  });
}]).

controller('PanoramasController', ['$scope', 'Panoramas', 'SharedMethods',
  function($scope, Panoramas, SharedMethods) {
  angular.extend($scope, SharedMethods);
  $scope.first_link = function(buttons) {
    var keys = SharedMethods.keys(buttons);
    if (!(keys instanceof Array)) return null;
    return buttons[keys[0]];
  };
  Panoramas.then(function(response) {
    var panoramas = response.data;
    $scope.panoramas = panoramas;
  });
}]).

controller('LinksController', ['$scope', 'Links', 'SharedMethods',
  function($scope, Links, SharedMethods) {
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
  $scope.keys = SharedMethods.keys;
  Links.then(function(links) {
    $scope.links = links;
  });
}]).

controller('HelpController', ['$scope', 'Helps', 'HelpTopics',
  '$routeParams', '$rootScope',
  function($scope, Helps, HelpTopics, $routeParams, $rootScope) {
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
}]).

run(['$window', function($window) {
  $window.addEventListener('load', function() {
    $window.FastClick.attach($window.document.body);
  }, false);
  if (console) console.info('git clone https://github.com/cghio/cghio.git');
}]);
