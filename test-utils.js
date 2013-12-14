function stub() {
    var out = {};
    angular.forEach(arguments, function(m) {
        out[m] = jasmine.createSpy();
    });
    return out;
}

function reject($q, error) {
    var def = $q.defer();
    def.reject(error);
    return def.promise;
}

function resolve($q, val) {
    var def = $q.defer();
    def.resolve(val);
    return def.promise;
}

function firebaseStub() {
    // firebase is invoked using new Firebase, but we need a static ref
    // to the functions before it is instantiated, so we cheat here by
    // attaching the functions as Firebase.fns, and ignore new (we don't use `this` or `prototype`)
    var FirebaseStub = function() {
        return FirebaseStub.fns;
    };
    FirebaseStub.fns = { callbackVal: null };
    customSpy(FirebaseStub.fns, 'set', function(value, cb) { cb && cb(FirebaseStub.fns.callbackVal); });
    customSpy(FirebaseStub.fns, 'child', function() { return FirebaseStub.fns; });
    return FirebaseStub;
}

function angularAuthStub() {
    function AuthStub() { return AuthStub.fns; }
    AuthStub.fns = stub('$login', '$logout');
    return AuthStub;
}

function customSpy(obj, m, fn) {
    obj[m] = fn;
    spyOn(obj, m).andCallThrough();
}

function flush($timeout) {
    try { $timeout.flush(); }
    catch(e) {} // is okay
}

function ErrorWithCode(code, msg) {
    this.code = code;
    this.msg = msg;
}
ErrorWithCode.prototype.toString = function() { return this.msg; }