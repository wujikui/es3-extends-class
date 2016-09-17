(function () {

    var KEY_IDENTITY = '$$EXTENDS_OBJECT_CLASS-{08929965-827f-45a7-bcbf-81afeefbf65f}$$';
    var KEY_DENNY_NEW_OPERATOR = '$$EXTENDS_OBJECT_DENNY_NEW_OPERATOR-{f74c15f3-5081-40a8-ad09-2d07bc8982bb}$$';
    var KEY_PARENT_TYPE_LIST = '$$EXTENDS_OBJECT_PARENT_TYPE_LIST-{3813ca37-3773-4bc4-8f5c-0b0c2136ea89}$$';

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

    extendsObject.isWrappedClass = function (type) {
        return (type && type[KEY_IDENTITY] === KEY_IDENTITY) || false;
    };
    extendsObject.isWrappedObject = function (obj) {
        return (obj && extendsObject.isWrappedClass(obj.constructor)) || false;
    };
    extendsObject.isParentClass = function (type, parentClass) {
        if (extendsObject.isWrappedClass(type)) {
            var parentTypeList = type[KEY_PARENT_TYPE_LIST];
            for (var i = 0, len = parentTypeList.length; i < len; i++) {
                if (parentTypeList[i] === parentClass) {
                    return true;
                }
            }
        }
        return false;
    };
    extendsObject.isChildClass = function (type, childClass) {
        return extendsObject.isParentClass(childClass, type);
    };
    extendsObject.isInstanceOf = function (obj, type) {
        if (typeof obj === 'object') {
            if (typeof type === 'function') {
                return obj instanceof type;
            } else if (typeof type === 'object') {
                return (extendsObject.isWrappedObject(obj) && obj === type) ||
                    obj.constructor === type || extendsObject.isParentClass(obj.constructor, type);
            }
        }
        return false;
    };

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

            if (!this.hasOwnProperty('$$parent')) { // new

                var args = Array.prototype.slice.call(arguments);
                if (args.pop() !== KEY_DENNY_NEW_OPERATOR) {
                    throw new Error('not supports new operator, uses instead of `Type.new()`');
                }

                this.$$parent = args.pop();
                // uses `this.$$reconstruct(arg1...)` to call parentType's constructor
                // this would cause executes constructor on inherited chain again, from baseClass to subClass
                this.$$reconstruct = (function (parent) {
                    return function () {
                        parent.constructor.apply(parent, arguments);
                    }
                })(this.$$parent);
                this.$$isReconstructing = false;

                childType.apply(this, args);

            } else { // reconstruct

                // user can also call `ParentType.apply(parentInstance, [])` instead of `this.$$reconstruct(...)`

                this.$$isReconstructing = true;

                this.$$parent.constructor.apply(this.$$parent, arguments);
                childType.apply(this, arguments);

                this.$$isReconstructing = false;

            }
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

        ResultAnonymousClass[KEY_IDENTITY] = KEY_IDENTITY;
        ResultAnonymousClass[KEY_PARENT_TYPE_LIST] = [];
        if (parentType[KEY_PARENT_TYPE_LIST]) {
            ResultAnonymousClass[KEY_PARENT_TYPE_LIST] = parentType[KEY_PARENT_TYPE_LIST].slice(0);
        }
        ResultAnonymousClass[KEY_PARENT_TYPE_LIST].push(parentType);

        (function () {
            for (var key in parentType) {
                if (key !== 'prototype' && key !== KEY_IDENTITY && key !== KEY_PARENT_TYPE_LIST) {
                    ResultAnonymousClass[key] = parentType[key];
                }
            }
        })();
        (function () {
            for (var key in childType) {
                if (key !== 'prototype' && key !== KEY_IDENTITY && key !== KEY_PARENT_TYPE_LIST) {
                    ResultAnonymousClass[key] = childType[key];
                }
            }
        })();

        var DynamicMixinClass = function () {
            var prototype = childType.prototype;
            for (var key in prototype) {
                if (prototype.hasOwnProperty(key)) {
                    this[key] = prototype[key]
                }
            }
        };

        ResultAnonymousClass['new'] = function () { // not allowed to uses new operator

            var parentInstance = extendsObject.isWrappedClass(parentType) ?
                parentType.new.apply(parentType, arguments) : newObject(parentType, arguments);
            DynamicMixinClass.prototype = parentInstance;
            DynamicMixinClass.prototype.constructor = parentType; // TODO ?? what happened!  now `parentInstance.constructor === parentType`

            ResultAnonymousClass.prototype = new DynamicMixinClass(); // dynamic prototype!!!
            ResultAnonymousClass.prototype.constructor = ResultAnonymousClass;

            var wrappedArguments = Array.prototype.slice.call(arguments);
            wrappedArguments.push(parentInstance);
            wrappedArguments.push(KEY_DENNY_NEW_OPERATOR); // denny new

            return newObject(ResultAnonymousClass, wrappedArguments);
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
            this.$$parent = parentType; // just keep the same API
            this.$$reconstruct = function () {
            };
            this.$$isReconstructing = false;
        };
        ResultAnonymousClass.prototype = parentType;
        ResultAnonymousClass.prototype.constructor = ResultAnonymousClass;

        ResultAnonymousClass[KEY_IDENTITY] = KEY_IDENTITY;
        ResultAnonymousClass[KEY_PARENT_TYPE_LIST] = [];
        if (parentType[KEY_PARENT_TYPE_LIST]) {
            ResultAnonymousClass[KEY_PARENT_TYPE_LIST] = parentType[KEY_PARENT_TYPE_LIST].slice(0);
        }
        ResultAnonymousClass[KEY_PARENT_TYPE_LIST].push(parentType);

        var resultAnonymousInstance = new ResultAnonymousClass();
        resultAnonymousInstance.prototype = resultAnonymousInstance; // references to itself, while result is not a function/constructor
        resultAnonymousInstance[KEY_IDENTITY] = ResultAnonymousClass[KEY_IDENTITY];
        resultAnonymousInstance[KEY_PARENT_TYPE_LIST] = ResultAnonymousClass[KEY_PARENT_TYPE_LIST];

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
            if (!this.hasOwnProperty('$$parent')) {
                this.$$parent = parentType; // just keep the same API
                this.$$reconstruct = function () {
                };
                this.$$isReconstructing = true;
            }
            childType.apply(this, arguments);
            this.$$parent.isExecutingNativeConstructor = false;
        };
        ResultAnonymousClass.prototype = dynamicMixinInstance; // prototype is still static
        ResultAnonymousClass.prototype.constructor = ResultAnonymousClass;

        ResultAnonymousClass[KEY_IDENTITY] = KEY_IDENTITY;
        ResultAnonymousClass[KEY_PARENT_TYPE_LIST] = [];
        if (parentType[KEY_PARENT_TYPE_LIST]) {
            ResultAnonymousClass[KEY_PARENT_TYPE_LIST] = parentType[KEY_PARENT_TYPE_LIST].slice(0);
        }
        ResultAnonymousClass[KEY_PARENT_TYPE_LIST].push(parentType);

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
    }

    return extendsObject;

})();
