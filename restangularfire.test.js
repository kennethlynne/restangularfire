describe('Provider: restangularFire', function(){

    var $rootScope, firebaseRef, $firebase, restangularFire, snapshot, $httpBackend;

    beforeEach(function(){

        firebaseRef = function () {

        };

        firebaseRef.once = function (event, cb) {
            expect(event).toBe('value');

            cb(snapshot);
        };

        firebaseRef.toString = function () {
            return 'https://firebasehost.firebaseio.com/child1/child2/thing';
        }

        snapshot = {
            val: jasmine.createSpy('snapshot.val').andReturn(null)
        };

        $firebase = function () {
            return {
                $save: jasmine.createSpy('$firebase.$save'),
                $add: jasmine.createSpy('$firebase.$add'),
                $remove: jasmine.createSpy('$firebase.$remove')
            }
        };

        module('kennethlynne.restangularfire', function ($provide, restangularFireProvider) {
            $provide.value('$firebase', $firebase);
            restangularFireProvider.setAPIBase('http://api.base.com');
        });

        inject(function(_$rootScope_, _restangularFire_, _$httpBackend_){
            $rootScope = _$rootScope_;
            restangularFire = _restangularFire_;
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should throw an error if not exists', function() {
        var successsCb = jasmine.createSpy('successCb');
        var errorCb = jasmine.createSpy('errorCb');
        var finallyCb = jasmine.createSpy('finally');

        var result = restangularFire.get(firebaseRef).then(successsCb, errorCb).finally(finallyCb);
        $rootScope.$digest();

        expect(successsCb).not.toHaveBeenCalled();
        expect(errorCb).toHaveBeenCalled();
        expect(finallyCb).toHaveBeenCalled();
    });

    it('should not throw an error if not exists but force is enabled', function() {
        var successsCb = jasmine.createSpy('successCb');
        var errorCb = jasmine.createSpy('errorCb');
        var finallyCb = jasmine.createSpy('finally');

        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');

        var result = restangularFire.get(firebaseRef).then(successsCb, errorCb).finally(finallyCb);
        $rootScope.$digest();

        expect(successsCb).toHaveBeenCalled();
        expect(errorCb).not.toHaveBeenCalled();
        expect(finallyCb).toHaveBeenCalled();
    });

    it('should override model if passed an object', function() {
        var saveSpy = jasmine.createSpy('save');
        var addSpy = jasmine.createSpy('add');
        var finallyCb = jasmine.createSpy('finally');

        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');
        var item = null;

        restangularFire.get(firebaseRef, {$save:saveSpy, $add:addSpy}).then(function (response) {
            item = response;
        }).finally(finallyCb);
        $rootScope.$digest();
        expect(finallyCb).toHaveBeenCalled();

        item.$save();
        expect(saveSpy).toHaveBeenCalled();

        item.$add();
        expect(saveSpy).toHaveBeenCalled();
    });

    it('should attach the items path to the item', function() {
        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');
        var item = null;
        restangularFire.get(firebaseRef).then(function (response) {
            item = response;
        });
        $rootScope.$digest();

        expect(item.$_path).toBe('child1/child2/thing');
    });

    it('should do a patch to passed url on save', function() {
        var finallyCb = jasmine.createSpy('finally');

        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');
        var item = null;

        restangularFire.get(firebaseRef).then(function (response) {
            item = response;
        }).finally(finallyCb);
        $rootScope.$digest();

        expect(finallyCb).toHaveBeenCalled();

        $httpBackend.expectPATCH('http://api.base.com/child1/child2/thing', {data:'data'}).respond(200,'YEAH');
        item.data = 'data';
        item.$save();
        $httpBackend.flush();
    });

    it('should do a post to passed url on add', function() {
        var finallyCb = jasmine.createSpy('finally');

        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');
        var item = null;

        restangularFire.get(firebaseRef).then(function (response) {
            item = response;
        }).finally(finallyCb);
        $rootScope.$digest();

        expect(finallyCb).toHaveBeenCalled();

        $httpBackend.expectPOST('http://api.base.com/child1/child2/thing', {data:'data'}).respond(200,'YEAH');
        item.data = 'data';
        item.$add();
        $httpBackend.flush();
    });

    it('should do a delete to passed url on remove', function() {
        var finallyCb = jasmine.createSpy('finally');

        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');
        var item = null;

        restangularFire.get(firebaseRef).then(function (response) {
            item = response;
        }).finally(finallyCb);
        $rootScope.$digest();

        expect(finallyCb).toHaveBeenCalled();

        $httpBackend.expectDELETE('http://api.base.com/child1/child2/thing').respond(200,'YEAH');
        item.$remove();
        $httpBackend.flush();
    });


    it('should do a put to passed url on save', function() {
        var finallyCb = jasmine.createSpy('finally');

        snapshot = jasmine.createSpy('snapshot.val').andReturn('Firebase data');
        var item = null;

        restangularFire.get(firebaseRef).then(function (response) {
            item = response;
        }).finally(finallyCb);
        $rootScope.$digest();

        expect(finallyCb).toHaveBeenCalled();

        $httpBackend.expectPUT('http://api.base.com/child1/child2/thing').respond(200,'YEAH');
        item.$set();
        $httpBackend.flush();
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
