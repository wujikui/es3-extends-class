const assert = require('assert');
const extendsObject = require('../dist/extends-object.js');

describe('Inherit', function () {

    describe('#function class', function () {

        var ParentClass = function () {
            this.pt1 = 'pt1';
            this.pf1 = function () {
                return this.pt1;
            }
        };
        ParentClass.prototype = {
            pt2: 'pt2',
            pf2: function () {
                return this.pt2
            },
            parentFunc: function () {
                return this.pf1() + ',' + this.pf2()
            }
        };

        var ChildClassDefinition = function () {
            this.ct1 = 'ct1';
            this.cf1 = function () {
                return this.ct1;
            }
        };
        ChildClassDefinition.prototype = {
            ct2: 'ct2',
            cf2: function () {
                return this.ct2;
            },
            childFunc: function () {
                return this.cf1() + ',' + this.cf2();
            }
        };
        var ChildClass = extendsObject(ParentClass, ChildClassDefinition);

        var obj = ChildClass.new();

        it('speciality', function () {
            assert.equal('function', typeof ChildClass);
            assert.equal('[object Function]', Object.prototype.toString.call(ChildClass));
            assert.equal('object', typeof obj);
            assert.equal('[object Object]', Object.prototype.toString.call(obj));
        });
        it('instanceof', function () {
            assert.equal(true, obj instanceof ParentClass);
            assert.equal(true, obj instanceof ChildClass);
        });
        it('properties', function () {
            assert.equal('pt1', obj.pt1);
            assert.equal('pt2', obj.pt2);
            assert.equal('ct1', obj.ct1);
            assert.equal('ct2', obj.ct2);
        });
        it('methods', function () {
            assert.equal('pt1', obj.pf1());
            assert.equal('pt2', obj.pf2());
            assert.equal('ct1', obj.cf1());
            assert.equal('ct2', obj.cf2());
        });
        it('call instance', function () {
            assert.equal('pt1,pt2', ParentClass.prototype.parentFunc.call(obj));
            assert.equal('ct1,ct2', ChildClass.prototype.childFunc.call(obj));
        });
        it('prototypes', function () {
            assert.equal(false, ChildClass.prototype.hasOwnProperty('parentFunc'));
            assert.equal(false, ChildClass.prototype.hasOwnProperty('ct1'));
            assert.equal(false, ChildClass.prototype.hasOwnProperty('cf1'));
            assert.equal(true, ChildClass.prototype.hasOwnProperty('ct2'));
            assert.equal(true, ChildClass.prototype.hasOwnProperty('cf2'));
            assert(true, ChildClass.prototype === obj.$$parent.constructor.prototype);
            assert(true, ChildClass === obj.$$parent.constructor);
            assert(true, ParentClass.prototype === obj.$$parent.constructor.prototype);
            assert(true, ParentClass === obj.$$parent.constructor);
        });

    });

    describe('#plain object class', function () {

        var ParentClass = {
            pt: 'pt',
            pf: function () {
                return this.pt
            }
        };

        var ChildClassDefinition = {
            ct: 'ct',
            cf: function () {
                return this.ct;
            }
        };
        var ChildClass = extendsObject(ParentClass, ChildClassDefinition); // ChildClass is still an Object(not plain) after extended action
        var obj1 = ChildClass; // because of ChildClass is already an object, you can use it without instantiation
        var obj2 = ChildClass.new(); // just keep the same API, return itself

        var ChildFunctionClassDefinition = function () {
            this.ct1 = 'ct1';
            this.cf1 = function () {
                return this.ct1
            };
        };
        ChildFunctionClassDefinition.prototype = {
            ct2: 'ct2',
            cf2: function () {
                return this.ct2;
            },
            childFunc: function () {
                return this.cf1() + ',' + this.cf2();
            }
        };
        var ChildFunctionClass = extendsObject(ParentClass, ChildFunctionClassDefinition);
        var funcObj = new ChildFunctionClass(); // also supports ChildFunctionClass.new()

        it('speciality', function () {
            assert.equal(true, obj1 === obj2);
            assert.equal('object', typeof ChildClass.prototype);
            assert.equal('object', typeof ChildClass);
            assert.equal('[object Object]', Object.prototype.toString.call(ChildClass));
            assert.equal('function', typeof ChildFunctionClass);
            assert.equal('[object Function]', Object.prototype.toString.call(ChildFunctionClass));
        });
        it('instanceof', function () { // object cannot used by instanceof
            assert.equal(true, funcObj instanceof ChildFunctionClass);
        });
        it('properties', function () {
            assert.equal('pt', obj1.pt);
            assert.equal('ct', obj1.ct);
            assert.equal('pt', funcObj.pt);
            assert.equal('ct1', funcObj.ct1);
            assert.equal('ct2', funcObj.ct2);
        });
        it('methods', function () {
            assert.equal('pt', obj1.pf());
            assert.equal('ct', obj1.cf());
            assert.equal('pt', funcObj.pf());
            assert.equal('ct1', funcObj.cf1());
            assert.equal('ct2', funcObj.cf2());
        });
        it('call instance', function () {
            assert.equal('pt', ParentClass.pf.call(obj1));
            assert.equal('pt', ChildClass.prototype.pf.call(obj1));
            assert.equal('ct', ChildClass.prototype.cf.call(obj1));
            assert.equal('pt', ParentClass.pf.call(funcObj));
            assert.equal('ct1,ct2', ChildFunctionClass.prototype.childFunc.call(funcObj));
        });
        it('prototypes', function () {
            assert.equal(false, ChildClass.prototype.hasOwnProperty('pt'));
            assert.equal(false, ChildClass.prototype.hasOwnProperty('pf'));
            assert.equal(true, ChildClass.prototype.hasOwnProperty('ct'));
            assert.equal(true, ChildClass.prototype.hasOwnProperty('cf'));
            assert.equal(false, ChildFunctionClass.prototype.hasOwnProperty('pt'));
            assert.equal(false, ChildFunctionClass.prototype.hasOwnProperty('pf'));
            assert.equal(false, ChildFunctionClass.prototype.hasOwnProperty('ct1'));
            assert.equal(false, ChildFunctionClass.prototype.hasOwnProperty('cf1'));
            assert.equal(true, ChildFunctionClass.prototype.hasOwnProperty('ct2'));
            assert.equal(true, ChildFunctionClass.prototype.hasOwnProperty('cf2'));
        });

    });

    describe('#constructor and deep inherit', function () {

        var step = 0;
        var C1 = function (v) {
            // called default behavior firstly
            // then called this.$$reconstruct()
            if (!this.$$isReconstructing) {
                this.steps = [];
                this.args = [];
            }
            this.steps.push(++step);
            this.args.push(arguments);
            this.t1_1 = v;
            this.t1_2 = arguments[1];
        };
        C1.prototype = {
            t1_proto: 'C1'
        };
        C1.prototype.constructor = C1;
        var C2 = function (v2, v3, v4) {
            if (!this.$$isReconstructing) {
                this.steps = [];
                this.args = [];
            }
            this.steps.push(++step);
            this.args.push(arguments);
            this.$$reconstruct('x');
            this.t2 = v2;
        };
        C2.prototype = {
            t2_proto: 'C2'
        };
        var C3 = function (v2, v3, v4) {
            if (!this.$$isReconstructing) {
                this.steps = [];
                this.args = [];
            }
            this.steps.push(++step);
            this.args.push(arguments);
            // this.$$reconstruct()(v2, v3, v4); // default behavior
            this.t3 = v3;
        };
        C3.prototype = {
            t3_proto: 'C3'
        };
        var C4 = function (v1, v2, v3, v4) {
            if (!this.$$isReconstructing) {
                this.steps = [];
                this.args = [];
            }
            this.steps.push(++step);
            this.args.push(arguments);
            this.$$reconstruct(v2, v3, v4);
            this.t4 = v4;
        };
        C4.prototype = {
            t4_proto: 'C4'
        };

        var _C1 = C1;
        var _C2 = extendsObject(_C1, C2);
        var _C3 = extendsObject(_C2, C3);
        var _C4 = extendsObject(_C3, C4);

        // var C = extendsObject(extendsObject(extendsObject(C1, C2), C3), C4);
        var obj = _C4.new('a', 'b', 'c', 'd');

        it('arguments value', function () {
            assert.equal('x', obj.t1_1);
            assert.equal(undefined, obj.t1_2);
            assert.equal('C1', obj.t1_proto);
            assert.equal('b', obj.t2);
            assert.equal('C2', obj.t2_proto);
            assert.equal('c', obj.t3);
            assert.equal('C3', obj.t3_proto);
            assert.equal('d', obj.t4);
            assert.equal('C4', obj.t4_proto);
        });
        it('prototypes and constructors', function () {
            var obj4 = obj;
            var obj3 = obj4.$$parent;
            var obj2 = obj3.$$parent;
            var obj1 = obj2.$$parent;
            var obj1Type = obj1.constructor;
            var obj2Type = obj2.constructor;
            var obj3Type = obj3.constructor;
            var obj4Type = obj4.constructor;
            assert.equal(true, obj1.hasOwnProperty('t1_1'));
            assert.equal(true, obj1.hasOwnProperty('t1_2'));
            assert.equal(true, obj1Type.prototype.hasOwnProperty('t1_proto'));
            assert.equal(true, obj2.hasOwnProperty('t2'));
            assert.equal(true, obj2Type.prototype.hasOwnProperty('t2_proto'));
            assert.equal(true, obj3.hasOwnProperty('t3'));
            assert.equal(true, obj3Type.prototype.hasOwnProperty('t3_proto'));
            assert.equal(true, obj4.hasOwnProperty('t4'));
            assert.equal(true, obj4Type.prototype.hasOwnProperty('t4_proto'));
            assert.equal(true, _C1 === obj1Type);
            // assert.equal(true, C1.prototype === _C1.prototype);
            assert.equal(true, _C2 === obj2Type);
            assert.equal(false, C2.prototype === _C2.prototype);
            assert.equal(true, _C3 === obj3Type);
            assert.equal(false, C3.prototype === _C3.prototype);
            assert.equal(true, _C4 === obj4Type);
            assert.equal(false, C4.prototype === _C4.prototype);
        });
    });

    describe('#mixin types and deep inherit', function () {

        var C1 = {
            t1: 't1',
            f1: function () {
                return this.t1;
            }
        };
        var C2 = {
            t2: 't2',
            f2: function () {
                return this.t2;
            }
        };
        var C3 = function () {
            this.t3_1 = 't3_1';
            this.f3_1 = function () {
                return this.t3_1;
            };
        };
        C3.prototype = {
            t3_2: 't3_2',
            f3_2: function () {
                return this.t3_2;
            },
            f3: function () {
                return this.f3_1() + ',' + this.f3_2();
            }
        };
        var C4 = function () {
            this.t4_1 = 't4_1';
            this.f4_1 = function () {
                return this.t4_1;
            };
        };
        C4.prototype = {
            t4_2: 't4_2',
            f4_2: function () {
                return this.t4_2;
            },
            f4: function () {
                return this.f4_1() + ',' + this.f4_2()
            }
        };

        var _C1 = C1;
        var _C2 = extendsObject(_C1, C2);
        var _C3 = extendsObject(_C2, C3);
        var _C4 = extendsObject(_C3, C4);

        var obj = _C4.new();

        it('instance of', function () {
            assert.equal(true, obj instanceof _C4);
            assert.equal(true, obj instanceof _C3);
            assert.equal(false, obj instanceof C4);
            assert.equal(false, obj instanceof C3);
        });

        it('properties', function () {
            assert.equal('t4_2', obj.t4_2);
            assert.equal('t4_1', obj.t4_1);
            assert.equal('t3_2', obj.t3_2);
            assert.equal('t3_1', obj.t3_1);
            assert.equal('t2', obj.t2);
            assert.equal('t1', obj.t1);
        });

        it('methods', function () {
            assert.equal('t4_2', obj.f4_2());
            assert.equal('t4_1', obj.f4_1());
            assert.equal('t3_2', obj.f3_2());
            assert.equal('t3_1', obj.f3_1());
            assert.equal('t2', obj.f2());
            assert.equal('t1', obj.f1());
        });

        it('call instance', function () {
            assert.equal('t4_1,t4_2', _C4.prototype.f4.call(obj));
            assert.equal('t3_1,t3_2', _C3.prototype.f3.call(obj));
            assert.equal('t2', _C2.f2.call(obj));
            assert.equal('t1', _C1.f1.call(obj));
        });

        it('prototypes and constructors', function () {
            var obj4 = obj;
            var obj3 = obj4.$$parent;
            var obj2 = obj3.$$parent;
            var obj1 = obj2.$$parent;
            var obj1Type = obj1;
            var obj2Type = obj2;
            var obj3Type = obj3.constructor;
            var obj4Type = obj4.constructor;
            assert.equal(true, obj1.hasOwnProperty('t1'));
            assert.equal(true, obj1.hasOwnProperty('f1'));
            assert.equal(true, obj2.hasOwnProperty('t2'));
            assert.equal(true, obj2.hasOwnProperty('f2'));
            assert.equal(true, obj3.hasOwnProperty('t3_1'));
            assert.equal(true, obj3.hasOwnProperty('f3_1'));
            assert.equal(true, obj3Type.prototype.hasOwnProperty('t3_2'));
            assert.equal(true, obj3Type.prototype.hasOwnProperty('f3_2'));
            assert.equal(true, obj4.hasOwnProperty('t4_1'));
            assert.equal(true, obj4.hasOwnProperty('f4_1'));
            assert.equal(true, obj4Type.prototype.hasOwnProperty('t4_2'));
            assert.equal(true, obj4Type.prototype.hasOwnProperty('f4_2'));
            assert.equal(true, obj1Type === _C1);
            assert.equal(true, obj2Type === _C2);
            assert.equal(true, obj3Type === _C3);
            assert.equal(true, obj4Type === _C4);
        });

    });

});
