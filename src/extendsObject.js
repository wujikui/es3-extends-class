(function () {

    var KEY_DENNY_NEW_OPERATOR = '$$EXTENDS_OBJECT_DENNY_NEW_OPERATOR-{f74c15f3-5081-40a8-ad09-2d07bc8982bb}$$';

    function extendsObject() {

        /*
         * normalize arguments
         */
        var _params = normalizeEntryArguments.apply(undefined, arguments);
        var parentType = _params[0];
        var childType = _params[1];

        /*
         * affirm extends pattern
         */
        var isParentObject = typeof  parentType === 'object';
        var isChildObject = typeof childType === 'object';

        /*
         * extends
         */
        if (!isParentObject && !isChildObject) {
            return extendsObjectForFunctionToFunction(parentType, childType);
        }

    }

    // (ParentType, ChildType)
    // (ParentType, childConstructor, childPrototype[, childStaticObject])
    // ({ parent: ParentType, child: ChildType })
    // ({ parent: ParentType, constructor: Function, prototype: Object[, static: Object] })
    function normalizeEntryArguments() {

        var args = arguments;
        var parent, child;

        function checkParentType(parentType, argumentName) {
            if (typeof parentType !== 'function' && typeof parentType !== 'object') {
                throw new Error('[invalid param ParentType] ' + argumentName + ' should be' +
                    ' a function or object: ' + parentType);
            }
            return parentType;
        }

        function checkChildType(childType, argumentName) {
            if (typeof childType !== 'function' && typeof childType !== 'object') {
                throw new Error('[invalid param ChildType] ' + argumentName + ' should be ' +
                    'a function or object: ' + childType);
            }
            return childType;
        }

        function checkChildConstructor(constructor, argumentName) {
            if (typeof constructor !== 'function') {
                throw new Error('[invalid param constructor] ' + argumentName + ' should be ' +
                    'a function: ' + constructor);
            }
            return constructor;
        }

        function checkChildPrototype(prototype, argumentName) {
            if (typeof prototype !== 'object') {
                throw new Error('[invalid param prototype] ' + argumentName + ' should be ' +
                    'an object: ' + prototype)
            }
            return prototype;
        }

        function checkChildStatic(staticObject, argumentName) {
            if (staticObject !== undefined && typeof staticObject !== 'object') {
                throw new Error('[invalid param static] ' + argumentName + ' should be' +
                    ' an object or not specified: ' + staticObject);
            }
            return staticObject;
        }

        if (args.length === 0) {
            throw new Error('[invalid param] empty arguments');
        } else if (args.length === 1) { // (?)
            var option = args[0];
            parent = checkParentType(option.parent, 'arguments[0].parent');
            if (option.child) { // ({ parent: ParentType, child: ChildType })
                child = checkChildType(option.child, 'arguments[0].child');
            } else { // ({ parent: ParentType, constructor: Function, prototype: Object[, static: Object] })
                child = buildAnonymousClass({
                    constructor: checkChildConstructor(option.constructor, 'arguments[0].constructor'),
                    prototype: checkChildPrototype(option.prototype, 'arguments[0].prototype'),
                    'static': option.static ? checkChildStatic(option.static, 'arguments[0].static') : undefined
                })
            }
        } else if (args.length === 2) { // (ParentType, ChildType)
            parent = checkParentType(args[0], 'arguments[0]');
            child = checkChildType(args[1], 'arguments[1]');
        } else { // (ParentType, childConstructor, childPrototype[, childStaticObject])
            parent = checkParentType(args[0], 'arguments[0]');
            child = buildAnonymousClass({
                constructor: checkChildConstructor(args[1], 'arguments[1]'),
                prototype: checkChildPrototype(args[2], 'arguments[2]'),
                'static': args[3] ? checkChildStatic(args[3], 'arguments[3]') : undefined
            });
        }

        return [parent, child];

    }

    // build class type
    function buildAnonymousClass(constructor, prototype, staticObject) {
        var AnonymousClass = function () {
            return constructor.apply(this, arguments);
        };
        AnonymousClass.prototype = prototype;
        AnonymousClass.prototype.constructor = AnonymousClass;
        for (var key in staticObject) {
            if (staticObject.hasOwnProperty(key) && key !== 'prototype') {
                AnonymousClass[key] = staticObject[key];
            }
        }
        return AnonymousClass;
    }

    // return new Type() for uncertain parameter
    function newObject(constructor, args) {
        var AnonymousNewClass = function () {
            constructor.apply(this, args);
        };
        AnonymousNewClass.prototype = constructor.prototype;
        return new AnonymousNewClass();
    }

    function extendsObjectForFunctionToFunction(parentType, childType) {

        var ResultAnonymousClass = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args.length === 0 || args[args.length - 1] !== KEY_DENNY_NEW_OPERATOR) {
                throw new Error('not supports new operator, uses instead of `Type.new()`');
            }
            args.pop();
            childType.apply(this, args)
        };
        ResultAnonymousClass.prototype = (function () {
            // Type.prototype will changed when instantiates Type every time
            // initial prototype will be replaced after instantiated Type
            var eachList = [parentType.prototype, parentType, childType.prototype, childType];
            var proto = {};
            for (var i = 0; i < eachList.length; i++) {
                for (var key in eachList[i]) {
                    if (eachList[i].hasOwnProperty(key)) {
                        proto[key] = eachList[i][key]
                    }
                }
            }
            return proto;
        }());

        var DynamicMixinClass = function () {
            for (var key in childType.prototype) {
                if (childType.prototype.hasOwnProperty(key)) {
                    this[key] = childType.prototype[key]
                }
            }
        };

        ResultAnonymousClass['new'] = function () {

            DynamicMixinClass.prototype = newObject(parentType, arguments); // dynamic prototype!!!
            DynamicMixinClass.prototype.constructor = DynamicMixinClass;

            ResultAnonymousClass.prototype = new DynamicMixinClass(); // dynamic prototype!!!
            ResultAnonymousClass.prototype.constructor = ResultAnonymousClass;

            var withDennyKeyArguments = Array.prototype.slice.call(arguments); // denny new
            withDennyKeyArguments.push(KEY_DENNY_NEW_OPERATOR);
            return newObject(ResultAnonymousClass, withDennyKeyArguments);
        };

        return ResultAnonymousClass;
    }

    return extendsObject;

})();
