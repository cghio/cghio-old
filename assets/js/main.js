var App = angular.module('App', []);

App.factory('Builds', function($http) {
  return $http.get('/builds.json');
});

function BuildsController($scope, Builds) {
  Builds.success(function(builds) {
    $scope.builds = builds;
  });
}
