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

});
