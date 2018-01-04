define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function VueClass(target) {
        var original = target;
        var newConstructor = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var initParams = { el: '', data: {} };
            if (args.length == 1 && typeof args[0] == 'string') {
                initParams = {
                    el: args[0],
                    data: {},
                    watch: {},
                    computed: {},
                    updated: undefined
                };
                if (typeof this['metadata'] !== 'undefined') {
                    for (var varName in this['metadata'].vars) {
                        initParams.data[varName] = this[varName];
                    }
                    for (var varName in this['metadata'].watch) {
                        var descriptor = this['metadata'].watch[varName];
                        if (descriptor.deep)
                            initParams.watch[varName] = {
                                handler: this[descriptor.funcName],
                                deep: true
                            };
                        else
                            initParams.watch[varName] = this[descriptor.funcName];
                    }
                    for (var index in this['metadata'].computed) {
                        var descriptor = this['metadata'].computed[index];
                        if (typeof initParams.computed[descriptor.bindOn] === 'undefined')
                            initParams.computed[descriptor.bindOn] = {};
                        initParams.computed[descriptor.bindOn][descriptor.action] = this[descriptor.name];
                    }
                    if (this['metadata'].updated !== null) {
                        initParams.updated = this[this['metadata'].updated];
                    }
                }
            }
            else if (args.length == 1) {
                initParams = args[0];
            }
            // console.log(initParams);
            var c = function () {
                args.push(initParams);
                return original.apply(this, args);
            };
            c.prototype = original.prototype;
            return new c();
        };
        newConstructor.prototype = original.prototype;
        return newConstructor;
    }
    exports.VueClass = VueClass;
    function VueWatched(listenedPropertyOrDeep, deep) {
        if (listenedPropertyOrDeep === void 0) { listenedPropertyOrDeep = ''; }
        if (deep === void 0) { deep = false; }
        return function (target, propertyKey, descriptor) {
            if (typeof target['metadata'] === 'undefined')
                target['metadata'] = { watch: {}, vars: {}, computed: [], updated: null };
            var listenedProperty = '';
            if (listenedPropertyOrDeep === true) {
                deep = true;
                listenedPropertyOrDeep = null;
            }
            else if (listenedPropertyOrDeep === false) {
                deep = false;
                listenedPropertyOrDeep = null;
            }
            else if (listenedPropertyOrDeep === null) {
                listenedPropertyOrDeep = '';
            }
            else {
                listenedProperty = listenedPropertyOrDeep;
            }
            if (listenedProperty === '') {
                var wordsResearch = ['Watch'];
                for (var _i = 0, wordsResearch_1 = wordsResearch; _i < wordsResearch_1.length; _i++) {
                    var wordResearch = wordsResearch_1[_i];
                    if (propertyKey.indexOf(wordResearch) === propertyKey.length - wordResearch.length) {
                        listenedProperty = propertyKey.substr(0, propertyKey.length - wordResearch.length);
                        break;
                    }
                }
            }
            console.log(listenedProperty);
            target['metadata'].watch[listenedProperty] = { funcName: propertyKey, deep: deep };
        };
    }
    exports.VueWatched = VueWatched;
    function VueVar() {
        return function PropertyDecorator(target, propertyKey) {
            if (typeof target['metadata'] === 'undefined')
                target['metadata'] = { watch: {}, vars: {}, computed: [], updated: null };
            target['metadata'].vars[propertyKey] = true;
        };
    }
    exports.VueVar = VueVar;
    function VueUpdated() {
        return function PropertyDecorator(target, propertyKey) {
            if (typeof target['metadata'] === 'undefined')
                target['metadata'] = { watch: {}, vars: {}, computed: [], updated: null };
            target['metadata'].updated = propertyKey;
        };
    }
    exports.VueUpdated = VueUpdated;
    function VueComputed(varName, action) {
        if (varName === void 0) { varName = ''; }
        if (action === void 0) { action = ''; }
        return function PropertyDecorator(target, propertyKey) {
            if (typeof target['metadata'] === 'undefined')
                target['metadata'] = { watch: {}, vars: {}, computed: [], updated: null };
            if (varName == '' && action == '') {
                if (propertyKey.indexOf('get') == 0) {
                    action = 'get';
                    varName = propertyKey.charAt(3).toLowerCase() + propertyKey.substr(4);
                }
                else if (propertyKey.indexOf('set') == 0) {
                    action = 'set';
                    varName = propertyKey.charAt(3).toLowerCase() + propertyKey.substr(4);
                }
            }
            else if (action == '') {
                action = 'get';
            }
            if (varName == '') {
                varName = propertyKey;
            }
            target['metadata'].computed.push({ bindOn: varName, name: propertyKey, action: action });
        };
    }
    exports.VueComputed = VueComputed;
});
// class Test extends VueCompat{
// 	@VueVar('fdsfds')
// 	test : string = '';
//
// 	testNotWatched : string = 'grrrr';
//
// 	@VueWatched()
// 	testWatch(){
// 		console.log('MODIFIER');
// 	}
//
// 	@VueComputed()
// 	getTest2(){
// 		return this.test;
// 	}
//
// 	@VueComputed()
// 	setTest2(value : string){
// 		this.test = value;
// 	}
//
// 	constructor(container : string){
// 		super(container);
// 		console.log('INITIALIZED');
// 		this.test = 'HELLO';
// 	}
// }
//
// let test = new Test('#container'); 
//# sourceMappingURL=VueAnnotate.js.map