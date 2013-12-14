angular.module('kennethlynne.restangularfire', ['firebase'])
    .provider('restangularFire', function () {

        this.config = function () {

        };

        this.$get = function ($firebase, firebaseRef, $q) {

            /**
             * Creates a model that stays in sync with the server
             * @param fbRef the firebase reference
             * @param modelOverrides override the default methods ($save, $add, $remove, $bind and $set)
             * @returns {Object} model with $save, $add, $remove, $bind and $set methods
             */
            var modelFactory = function (fbRef, modelOverrides) {

                /**
                 * This will keep a local model on scope.attr in sync with an external server.
                 */
                var item = $firebase(fbRef);

                var _save = item.$save;
                var _bind = item.$bind;
                var _remove = item.$remove;
                var _set = item.$set;
                var _add = item.$add;

                //TODO: Override to send stripped down items via REST

                item.$save = function () {
                    _save();
                };

                item.$add = function () {
                    _add();
                };

                item.$remove = function () {
                    _remove();
                };

                item.$set = function () {
                    _set();
                };

                item.$bind = function ($scope, attr) {
                    _bind($scope, attr);
//                    var local = $parse(attr)($scope);
//
//                    var unbind = $scope.$watch(attr, function (newVal) {
//                        console.log(newVal);
//                    }, true);
//
//                    $scope.$on('$destroy', unbind);
                };

                return item;
            };

            /**
             * getFactory takes a firebase reference and returns a get function
             * @param fbRef firebase reference
             * @param force return a reference even if it does not exist yet server side
             * @returns {Function}
             */
            var getFactory = function (fbRef, force, modelOverrides) {

                /**
                 * Curried get function
                 * @returns promise that is resolved with a binder if reference is found, and rejected if not.
                 * Useful for providing 404 feedback and handling non existing data exceptions
                 */
                var _deferred = $q.defer();

                fbRef.once('value', function (snapshot) {
                    if (!force && snapshot.val() == null) {
                        _deferred.reject('Object not found');
                    }

                    _deferred.resolve( modelFactory(fbRef, modelOverrides) );
                });

                return _deferred.promise;
            }

            return {
                get: getFactory
            }


        }

    })
    .factory('firebaseRef', function (Firebase) {
        return function (path) {
            return new Firebase(path);
        }
    })
    .factory('restangularFireAuth', function ($rootScope, $firebaseAuth, firebaseRef, $timeout) {
        var auth = null;
        return {
            init: function (path) {
                return auth = $firebaseAuth(firebaseRef(), {path: path});
            },

            login: function (email, pass, callback) {
                assertAuth();
                auth.$login('password', {
                    email: email,
                    password: pass,
                    rememberMe: true
                }).then(function (user) {
                        callback && callback(null, user);
                    }, callback);
            },

            logout: function () {
                assertAuth();
                auth.$logout();
            },

            //TODO: Use REST API
            changePassword: function (opts) {
                assertAuth();
                var cb = opts.callback || function () {
                };
                if (!opts.oldpass || !opts.newpass) {
                    $timeout(function () {
                        cb('Please enter a password');
                    });
                }
                else if (opts.newpass !== opts.confirm) {
                    $timeout(function () {
                        cb('Passwords do not match');
                    });
                }
                else {
                    auth.$changePassword(opts.email, opts.oldpass, opts.newpass, cb);
                }
            },

            //TODO: Use REST API
            createAccount: function (email, pass, callback) {
                assertAuth();
                auth.$createUser(email, pass, callback);
            }
        };

        function assertAuth() {
            if (auth === null) {
                throw new Error('Must call restangularFireAuth.init() before using its methods');
            }
        }
    })