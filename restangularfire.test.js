describe('Provider: restangularFire', function(){

    var $rootScope, firebase;

    beforeEach(function(){
        module('kennethlynne.restangularfire');

        inject(function(_$rootScope_){
            $rootScope = _$rootScope_;
        });
    });

    it('Should render the directive', function(){
    });

});

describe('Factory: firebaseRef', function () {

    var $rootScope, firebaseRef, Firebase;

    beforeEach(function(){

        module('kennethlynne.restangularfire');

        inject(function(_$rootScope_, _firebaseRef_, _Firebase_){
            $rootScope = _$rootScope_;
            firebaseRef = _firebaseRef_;
            Firebase = _Firebase_;
        });
    });

    it('should create firebase references', function() {
        var ref = firebaseRef('url');
        expect(ref._url).toBe('url');
    });
});

describe('restangularFireAuth', function() {

    beforeEach(module('kennethlynne.restangularfire', function($provide) {
        $provide.value('Firebase', firebaseStub());
        $provide.value('$location', stub('path'));
        $provide.value('$firebaseAuth', angularAuthStub());
        $provide.value('firebaseRef', firebaseStub());
    }));

    describe('#login', function() {
        it('should return error if $firebaseAuth.$login fails',
            inject(function($q, $rootScope, restangularFireAuth, $firebaseAuth) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                $firebaseAuth.fns.$login.andReturn(reject($q, 'test_error'));
                restangularFireAuth.login('test@test.com', '123', cb);
                $rootScope.$apply();
                expect(cb).toHaveBeenCalledWith('test_error');
            })
        );

        it('should return user if $firebaseAuth.$login succeeds',
            inject(function(restangularFireAuth, $firebaseAuth, $rootScope, $q) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                $firebaseAuth.fns.$login.andReturn(resolve($q, {hello: 'world'}));
                restangularFireAuth.login('test@test.com', '123', cb);
                $rootScope.$apply();
                expect(cb).toHaveBeenCalledWith(null, {hello: 'world'});
            })
        );
    });

    describe('#logout', function() {
        it('should invoke $firebaseAuth.$logout()', function() {
            inject(function(restangularFireAuth, $firebaseAuth) {
                restangularFireAuth.init('/login');
                restangularFireAuth.logout();
                expect($firebaseAuth.fns.$logout).toHaveBeenCalled();
            });
        });
    });

    describe('#changePassword', function() {
        beforeEach(inject(function($timeout, $firebaseAuth) {
            customSpy($firebaseAuth.fns, '$changePassword', function(eml, op, np, cb) { $timeout(function() { cb(null); }) });
        }));

        it('should fail if old password is missing',
            inject(function(restangularFireAuth, $firebaseAuth, $timeout) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                restangularFireAuth.changePassword({
                    newpass: 123,
                    confirm: 123,
                    callback: cb
                });
                flush($timeout);
                expect(cb).toHaveBeenCalledWith('Please enter a password');
                expect($firebaseAuth.fns.$changePassword).not.toHaveBeenCalled();
            })
        );

        it('should fail if new password is missing',
            inject(function(restangularFireAuth, $firebaseAuth, $timeout) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                restangularFireAuth.changePassword({
                    oldpass: 123,
                    confirm: 123,
                    callback: cb
                });
                flush($timeout);
                expect(cb).toHaveBeenCalledWith('Please enter a password');
                expect($firebaseAuth.fns.$changePassword).not.toHaveBeenCalled();
            })
        );

        it('should fail if passwords don\'t match',
            inject(function(restangularFireAuth, $firebaseAuth, $timeout) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                restangularFireAuth.changePassword({
                    oldpass: 123,
                    newpass: 123,
                    confirm: 124,
                    callback: cb
                });
                flush($timeout);
                expect(cb).toHaveBeenCalledWith('Passwords do not match');
                expect($firebaseAuth.fns.$changePassword).not.toHaveBeenCalled();
            })
        );

        it('should fail if $firebaseAuth fails',
            inject(function(restangularFireAuth, $firebaseAuth, $timeout) {
                var cb = jasmine.createSpy();
                customSpy($firebaseAuth.fns, '$changePassword', function(email, op, np, cb) {
                    cb(new ErrorWithCode(123, 'errr'));
                });
                restangularFireAuth.init('/login');
                restangularFireAuth.changePassword({
                    oldpass: 124,
                    newpass: 123,
                    confirm: 123,
                    callback: cb
                });
                flush($timeout);
                expect(cb.argsForCall[0][0].toString()).toBe('errr');
                expect($firebaseAuth.fns.$changePassword).toHaveBeenCalled();
            })
        );

        it('should return null if $firebaseAuth succeeds',
            inject(function(restangularFireAuth, $firebaseAuth, $timeout) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                restangularFireAuth.changePassword({
                    oldpass: 124,
                    newpass: 123,
                    confirm: 123,
                    callback: cb
                });
                flush($timeout);
                expect(cb).toHaveBeenCalledWith(null);
                expect($firebaseAuth.fns.$changePassword).toHaveBeenCalled();
            })
        );
    });

    describe('#createAccount', function() {
        beforeEach(inject(function($timeout, $firebaseAuth) {
            customSpy($firebaseAuth.fns, '$createUser', function(eml, pass, cb) { $timeout(function() { cb(null); }) });
        }));

        it('should invoke $firebaseAuth',
            inject(function(restangularFireAuth, $firebaseAuth) {
                restangularFireAuth.init('/login');
                restangularFireAuth.createAccount('test@test.com', 123);
                expect($firebaseAuth.fns.$createUser).toHaveBeenCalled();
            })
        );

        it('should invoke callback if error',
            inject(function(restangularFireAuth, $timeout, $firebaseAuth) {
                var cb = jasmine.createSpy();
                customSpy($firebaseAuth.fns, '$createUser', function(email, pass, cb) {
                    cb('joy!');
                });
                restangularFireAuth.init('/login');
                restangularFireAuth.createAccount('test@test.com', 123, cb);
                flush($timeout);
                expect(cb).toHaveBeenCalledWith('joy!');
            })
        );

        it('should invoke callback if success',
            inject(function(restangularFireAuth, $timeout) {
                var cb = jasmine.createSpy();
                restangularFireAuth.init('/login');
                restangularFireAuth.createAccount('test@test.com', 123, cb);
                flush($timeout);
                expect(cb).toHaveBeenCalledWith(null);
            })
        )
    });

});