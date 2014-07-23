var CGH = angular.module('CGH', [ 'ngRoute', 'ngSanitize' ]).

config([   '$routeProvider', '$locationProvider', '$injector',
  function( $routeProvider ,  $locationProvider ,  $injector ) {
  $routeProvider.
  when('/', {
    templateUrl: 'main',
    controller: 'MainController'
  }).
  when('/builds', {
    title: 'Builds',
    templateUrl: 'builds',
    controller: 'BuildsController'
  }).
  when('/sites', {
    title: 'Sites',
    templateUrl: 'sites',
    controller: 'SitesController'
  }).
  when('/panoramas', {
    title: 'Panoramas',
    templateUrl: 'panoramas',
    controller: 'PanoramasController'
  }).
  when('/links', {
    title: 'Links',
    templateUrl: 'links',
    controller: 'LinksController'
  }).
  when('/help/:help_topic?', {
    title: 'Help',
    templateUrl: 'help',
    controller: 'HelpController'
  }).
  when('/about', {
    title: 'About',
    templateUrl: 'about'
  }).
  otherwise({
    title: '404 Page Not Found',
    templateUrl: '_404'
  });
  var isDEV = false;
  try { isDEV = !!$injector.get('DEVELOPMENT'); } catch(e) {}
  if (isDEV) {
    $locationProvider.html5Mode(false);
  } else {
    $locationProvider.html5Mode(true);
  }
}]).

run([      '$location', '$rootScope', '$route',
  function( $location ,  $rootScope ,  $route ) {
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    var route = current.$$route || $route.routes[null];
    var title = route.title || '';
    if (title) title += ' — ';
    document.title = title + 'cgh.io';
    window.scrollTo(0, 0);
  });
  doc = angular.element(document).on('keypress', function(event) {
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var key = event.which || event.keyCode;
    var verticalLinks = false;
    if (key === 59 || key === 39) verticalLinks = true;
    var keyd;
    if (key === 59 || key === 91) keyd = 1;
    if (key === 39 || key === 93) keyd = 2;
    if (!keyd) return;
    var links, linksLength;
    if (verticalLinks) {
      links = document.querySelector('.vertical-links');
    } else {
      links = document.querySelector('.horizontal-links');
    }
    if (links) links = links.querySelectorAll('a');
    linksLength = links ? links.length : 0;
    if (!linksLength) return;
    links = Array.prototype.slice.call(links);
    links = links.map(function(item) {
      return item.getAttribute('href').replace(/^\/#/, '');
    });
    var url = $location.url().replace(/^\/#/, '');
    var index = links.indexOf(url);
    if (index === -1) {
      links.forEach(function(link, i) {
        if (url.slice(0, link.length) === link) index = i;
      });
    }
    if (keyd === 1) {
      index--;
    } else {
      index++;
    }
    if (index < 0) index = links.length - 1;
    if (index > links.length - 1) index = 0;

    event.preventDefault();
    $location.path(links[index]);
    $rootScope.$apply();
  });
}]).

/* directives */

directive('body', [function() {
  return {
    restrict: 'E',
    templateUrl: 'index'
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

factory('WebP', [
           '$q',
  function( $q ) {
  var deferred = $q.defer();
  // from Modernizr:
  var image = new Image();
  var func = function (event) {
    var result = event.type === 'load' ? image.width == 1 : false;
    deferred.resolve(result);
  }
  image.onerror = func;
  image.onload = func;
  image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  return deferred.promise;
}]).

factory('Links', [
           'PostsLinksYml',
  function( PostsLinksYml ) {
  var COLUMNS = 3;
  var links = PostsLinksYml;
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
      new_links[i][name].forEach(function(item) {
        item.__group__ = name;
      });
      count++;
    }
  }
  return new_links;
}]).

service('HelpTopics', [
           '$http', '$injector',
  function( $http ,  $injector ) {
  var self = this;

  this.number_of_objects = 10;
  this.help_topics = [];
  this.help_topic_objs = [];

  this.betterName = function(name) {
    return name.match(/[A-Za-z0-9]+/g).map(function(s) {
      return s[0].toUpperCase() + s.slice(1).toLowerCase();
    }).join('');
  };

  this.get = function(help_topic, callback) {
    help_topic = this.betterName(help_topic);
    var index = self.help_topics.indexOf(help_topic);
    if (index === -1) {
      var constants = CGH._invokeQueue.filter(function(item){
        return item[1] === 'constant' && item[2][0].indexOf(help_topic) > -1;
      });
      var content = $injector.get(constants[0][2][0]);
      self.help_topics.unshift(help_topic);
      self.help_topic_objs.unshift(content);
      self.help_topics.splice(self.number_of_objects);
      self.help_topic_objs.splice(self.number_of_objects);
      if (callback) callback(help_topic, content);
    } else {
      if (callback) callback(help_topic, self.help_topic_objs[index]);
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

controller('MainController', [
           '$scope', 'PostsRepositoriesYml', 'SharedMethods', 'WebP',
  function( $scope ,  PostsRepositoriesYml ,  SharedMethods ,  WebP ) {
  angular.extend($scope, SharedMethods);
  WebP.then(function(supported) {
    if (supported) $scope.webp = '.webp';
    $scope.items = PostsRepositoriesYml;
  });
}]).

controller('BuildsController', [
           '$scope', 'PostsBuildsYml',
  function( $scope ,  PostsBuildsYml ) {
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
  $scope.builds = PostsBuildsYml;
}]).

controller('SitesController', [
           '$scope', 'PostsSitesYml', 'SharedMethods', 'WebP',
  function( $scope ,  PostsSitesYml ,  SharedMethods ,  WebP ) {
  angular.extend($scope, SharedMethods);
  WebP.then(function(supported) {
    if (supported) $scope.webp = '.webp';
    $scope.items = PostsSitesYml;
  });
}]).

controller('PanoramasController', [
           '$scope', 'PostsPanoramasYml', 'SharedMethods', 'WebP',
  function( $scope ,  PostsPanoramasYml ,  SharedMethods ,  WebP ) {
  angular.extend($scope, SharedMethods);
  $scope.first_link = function(buttons) {
    var keys = SharedMethods.keys(buttons);
    if (!(keys instanceof Array)) return null;
    return buttons[keys[0]];
  };
  WebP.then(function(supported) {
    if (supported) $scope.webp = '.webp';
    $scope.panoramas = PostsPanoramasYml;
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
  $scope.links = Links;
}]).

controller('HelpController', [
           '$scope', 'HelpJson', 'HelpTopics', '$routeParams', '$rootScope',
  function( $scope,   HelpJson,   HelpTopics,   $routeParams,   $rootScope) {
  var help_topic = $routeParams.help_topic;

  HelpJson.forEach(function(h) {
    h.name = HelpTopics.betterName(h.slug);
  });

  $scope.helps = HelpJson;

  if (help_topic) {
    HelpTopics.get(help_topic, function(name, content) {
      $scope.help_topic_name = name;
      $scope.help_topic_content = content;
    });
  }
}]).

run(['$window', function($window) {
  $window.addEventListener('load', function() {
    $window.FastClick.attach($window.document.body);
  }, false);
  if (console) console.info('git clone https://github.com/cghio/cghio.git');
}]);
