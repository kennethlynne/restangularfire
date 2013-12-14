angular.module('kennethlynne.restangularfire', ['firebase'])
    .provider('restangularFire', function(){

        this.config = function () {

        };

        this.$get = function () {
            return {

            }
        }

    })
    .factory('firebaseRef', function (Firebase) {
        return function (path) {
            return new Firebase(path);
        }
    })
    .factory('restangularFireAuth', function($rootScope, $firebaseAuth, firebaseRef, $timeout) {
        var auth = null;
        return {
            init: function(path) {
                return auth = $firebaseAuth(firebaseRef(), {path: path});
            },

            login: function(email, pass, callback) {
                assertAuth();
                auth.$login('password', {
                    email: email,
                    password: pass,
                    rememberMe: true
                }).then(function(user) {
                        callback && callback(null, user);
                    }, callback);
            },

            logout: function() {
                assertAuth();
                auth.$logout();
            },

            changePassword: function(opts) {
                assertAuth();
                var cb = opts.callback || function() {};
                if( !opts.oldpass || !opts.newpass ) {
                    $timeout(function(){ cb('Please enter a password'); });
                }
                else if( opts.newpass !== opts.confirm ) {
                    $timeout(function() { cb('Passwords do not match'); });
                }
                else {
                    auth.$changePassword(opts.email, opts.oldpass, opts.newpass, cb);
                }
            },

            createAccount: function(email, pass, callback) {
                assertAuth();
                auth.$createUser(email, pass, callback);
            }
        };

        function assertAuth() {
            if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
        }
    })