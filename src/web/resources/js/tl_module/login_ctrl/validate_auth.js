characterApp.directive('uniqueName', function($timeout, $q) {
  return {
    restrict: 'AE',
    require: 'ngModel',
    link: function(scope, elm, attr, model) { 
      // model.$asyncValidators.usernameExists = function() {
      //when the scope changes, check the field.
        scope.$watch(attr.ngModel, function(value) {
          // if there was a previous attempt, stop it.
          if(toId) clearTimeout(toId);

          // start a new attempt with a delay to keep it from
          toId = setTimeout(function(){
            // call to some API that echo "0" or echo "1"
            $http.get('http://127.0.0.1:8000/cmd/auth/uniquename?name=' + value).success(function(data) {

              //set the validity of the field
              if (data == "0") 
              {
                  ctrl.$setValidity('uniqueName', false);
              }
              else if (data == "1")
              {
                  ctrl.$setValidity('uniqueName', true);
              }
            });
          }, 1000);
        })
      
        
        //here you should access the backend, to check if username exists
        //and return a promise
        //here we're using $q and $timeout to mimic a backend call 
        //that will resolve after 1 sec

        // var defer = $q.defer();
        // $timeout(function(){
          // model.$setValidity('uniqueName', false); 
          // defer.resolve;
        // }, 1000);
        // return defer.promise;
      };
    }
  } 
});