(function () {

    var KEY_DENNY_NEW_OPERATOR = '$$EXTENDS_OBJECT_DENNY_NEW_OPERATOR-{f74c15f3-5081-40a8-ad09-2d07bc8982bb}$$';

    function extendsObject(parentType, childType) {

        /*
         * normalize arguments
         */
        if (typeof parentType !== 'function' && typeof parentType !== 'object') {
            throw new Error('[invalid param ParentType] arguments[0] should be' +
                ' a function or object: ' + parentType);
        }
        if (typeof childType !== 'function' && typeof childType !== 'object') {
            throw new Error('[invalid param ChildType] arguments[1] should be ' +
                'a function or object: ' + childType);
        }

        /*
         * affirm extends pattern
         */
        var isParentObject = typeof  parentType === 'object';
        var isChildObject = typeof childType === 'object';
        if (!isParentObject && isChildObject) {
            throw new Error('[invalid action] not supports extends an object from a function');
        }

        /*
         * extends
         */
        if (!isParentObject && !isChildObject) {
            return functionToFunction(parentType, childType);
        }
        if (isParentObject && isChildObject) {
            return objectToObject(parentType, childType);
        }
        if (isParentObject && !isChildObject) {
            return objectToFunction(parentType, childType);
        }

    }

    // return new Result() = {
    //     ...: childType.this,
    //     __proto__: {
    //         ...: childType.prototype
    //         __proto__: {
    //             ...: parentType.this
    //             __proto__: {
    //                 ...: parentType.prototype
    //             }
    //         }
    //     }
    // }
    function functionToFunction(parentType, childType) {

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

        ResultAnonymousClass['new'] = function () { // not allowed to uses new operator

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

    // return result = {
    //     prototype: result,       // references to itself, we can use it via Result.prototype.foo.call(), what be equivalent to result.foo()
    //     ...: childType,
    //     __proto__: {
    //         ...: parentType
    //     }
    // }
    function objectToObject(parentType, childType) {

        var ResultAnonymousClass = function () {
            for (var key in childType) {
                if (childType.hasOwnProperty(key)) {
                    this[key] = childType[key];
                }
            }
        };
        ResultAnonymousClass.prototype = parentType;
        ResultAnonymousClass.prototype.constructor = ResultAnonymousClass;

        var resultAnonymousInstance = new ResultAnonymousClass();
        resultAnonymousInstance.prototype = resultAnonymousInstance; // references to itself, while result is not a function/constructor

        resultAnonymousInstance['new'] = function () { // keep the same API
            return resultAnonymousInstance;
        };

        return resultAnonymousInstance; // return is an object, not function/constructor
    }

    // return new Result() = {
    //     ...: childType.this,
    //     __proto__: {
    //         ...: childType.prototype,
    //         __proto__: {
    //             ...: parentType          // parentType is a plain object
    //         }
    //     }
    // }
    function objectToFunction(parentType, childType) {

        var DynamicMixinClass = function () {
            for (var key in childType.prototype) {
                if (childType.prototype.hasOwnProperty(key)) {
                    this[key] = childType.prototype[key]
                }
            }
        };
        DynamicMixinClass.prototype = parentType;
        DynamicMixinClass.prototype.constructor = DynamicMixinClass;
        var dynamicMixinInstance = new DynamicMixinClass();

        var ResultAnonymousClass = function () {
            childType.apply(this, arguments);
        };
        ResultAnonymousClass.prototype = dynamicMixinInstance; // prototype is still static
        ResultAnonymousClass.prototype.constructor = ResultAnonymousClass;

        ResultAnonymousClass['new'] = function () { // just keep the same API. we can also use new operator
            return newObject(ResultAnonymousClass, arguments);
        };

        return ResultAnonymousClass;
    }

    // return new Type() for uncertain parameter
    function newObject(Type, args) {
        if (args.length < 8) {
            switch (args.length) {
                case 0:
                    return new Type();
                case 1:
                    return new Type(args[0]);
                case 2:
                    return new Type(args[0], args[1]);
                case 3:
                    return new Type(args[0], args[1], args[2]);
                case 4:
                    return new Type(args[0], args[1], args[2], args[3]);
                case 5:
                    return new Type(args[0], args[1], args[2], args[3], args[4]);
                case 6:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5]);
                case 7:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
            }
        } else if (args.length <= 16) {
            switch (args.length) {
                case 8:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
                case 9:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
                case 10:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
                case 11:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
                case 12:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
                case 13:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
                case 14:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]);
                case 15:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14]);
                case 16:
                    return new Type(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14], args[15]);
            }
        } else {
            throw new Error('[not supports] not supports long arguments. arguments.length == ' + arguments.length);
        }


        // code generator
        // [[0, 8], [8, 16 + 1]].forEach(function (conf) {
        //     var begin = conf[0];
        //     var end = conf[1];
        //     var result = [];
        //     result.push('switch (args.length) {');
        //     for (var len = begin; len < end; len++) {
        //         result.push('\tcase ' + len + ':\n\t\treturn new Type(' + (function () {
        //                 var r = [];
        //                 for (var i = 0; i < len; i++) {
        //                     r.push('args[' + i + ']')
        //                 }
        //                 return r.join(', ');
        //             })() +
        //             ');');
        //     }
        //     result.push('}');
        //     console.log(result.join('\n'));
        //     console.log('\n\n\n\n');
        // });


        // or use extended class
        // var AnonymousNewClass = function () {
        //     constructor.apply(this, args);
        // };
        // AnonymousNewClass.prototype = constructor.prototype;
        // return new AnonymousNewClass();
    }

    return extendsObject;

})();
