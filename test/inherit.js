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
        var funcObj = ChildFunctionClass.new();

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

});
