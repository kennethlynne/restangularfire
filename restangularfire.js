angular.module('kennethlynne.restangularfire', ['firebase'])
    .provider('restangularFire', function () {

        var apiBase = null;

        this.setAPIBase = function (url) {
            apiBase = url;
        };

        function assertConfigured() {
            if(apiBase == null) throw 'You need to configure restangularFire with an API url';
        }

        this.$get = function ($firebase, firebaseRef, $q, $http) {

            /**
             * Creates a model that stays in sync with the server
             * @param fbRef the firebase reference
             * @param modelDecorator override the default methods ($save, $add, $remove, $bind and $set)
             * @returns {Object} model with $save, $add, $remove, $bind and $set methods
             */
            var modelFactory = function (fbRef, modelDecorator) {

                /**
                 * This will keep a local model on scope.attr in sync with an external server.
                 */
                var item = $firebase(fbRef),
                _save = item.$save,
                _bind = item.$bind,
                _remove = item.$remove,
                _set = item.$set,
                _add = item.$add;

                var url = fbRef.toString();
                var matches = url.match(/http(s)?\:\/\/[a-zA-Z0-9\.-]+\.com(\/)?(.*)$/);

                if (!matches || !matches[3] || !matches[3].length > 0) {
                    throw 'Unexpeted path. Got ' + url;
                }

                var path = matches[3];
                var itemAPIUrl = apiBase + '/' + path;

                function save() {
                    //Remove all properties beginning with $
                    var data = angular.fromJson(angular.toJson(item));

                    $http.put(itemAPIUrl, data);
                }

                function add() {
                    //Remove all properties beginning with $
                    var data = angular.fromJson(angular.toJson(item));

                    $http.post(itemAPIUrl, data);
                }

                item.$save = save;
                item.$add = add;
                item.$_path = path;

                if(typeof modelDecorator == 'object')
                {
                    angular.extend(item, modelDecorator);
                }
                else if(typeof modelDecorator == 'function')
                {
                    modelDecorator(item);
                }

                return item;
            };

            /**
             * getFactory takes a firebase reference and returns a get function
             * @param fbRef firebase reference
             * @param force return a reference even if it does not exist yet server side
             * @returns {Function}
             * @param modelOverrides key value pairs of overrides for $save, $set, $add, $remove and $bind
             */
            var getFactory = function (fbRef, modelOverrides, force) {
                assertConfigured();

                /**
                 * Curried get function
                 * @returns promise that is resolved with a binder if reference is found, and rejected if not.
                 * Useful for providing 404 feedback and handling non existing data exceptions
                 */
                var _deferred = $q.defer();

                fbRef.once('value', function (snapshot) {
                    if (!force && !!snapshot && !!snapshot.val && snapshot.val() == null) {
                        _deferred.reject('Object not found');
                    }
                    _deferred.resolve( modelFactory(fbRef, modelOverrides) );
                });

                return _deferred.promise;
            };

            return {
                get: getFactory
            }


        }

    })
    .factory('firebaseRef', function (Firebase) {
        return function (path) {
            var ref = new Firebase(path);
            return ref;
        }
    });