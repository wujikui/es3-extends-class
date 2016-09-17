const assert = require('assert');
const extendsClass = require('../dist/extends-class.js');

describe('Api', function () {

    function negativeIs(action) {
        assert.equal(false, extendsClass[action](undefined));
        assert.equal(false, extendsClass[action](true));
        assert.equal(false, extendsClass[action](false));
        assert.equal(false, extendsClass[action](''));
        assert.equal(false, extendsClass[action]('string'));
        assert.equal(false, extendsClass[action](-1));
        assert.equal(false, extendsClass[action](0));
        assert.equal(false, extendsClass[action](1));
        assert.equal(false, extendsClass[action]({}));
        assert.equal(false, extendsClass[action](null));
        assert.equal(false, extendsClass[action](new Object()));
        assert.equal(false, extendsClass[action](function () {
        }));
        assert.equal(false, extendsClass[action](this));
        assert.equal(false, extendsClass[action](global));
    }

    describe('#isWrappedClass', function () {

        var C1 = extendsClass({}, {});
        var C2 = extendsClass({}, function () {
        });
        var C3 = extendsClass(function () {
        }, function () {
        });
        var C4 = extendsClass(C1, C2);
        var C5 = extendsClass(C1, C3);
        var C6 = extendsClass(C2, C3);

        it('positive', function () {
            assert.equal(true, extendsClass.isWrappedClass(C1));
            assert.equal(true, extendsClass.isWrappedClass(C2));
            assert.equal(true, extendsClass.isWrappedClass(C3));
            assert.equal(true, extendsClass.isWrappedClass(C4));
            assert.equal(true, extendsClass.isWrappedClass(C5));
            assert.equal(true, extendsClass.isWrappedClass(C6));
        });

        it('negative', function () {
            negativeIs('isWrappedClass');
        });
    });

    describe('#isWrappedObject', function () {

        var o1 = extendsClass({}, {});
        var o2 = new (extendsClass({}, function () {
        }))();
        var o3 = extendsClass(function () {
        }, function () {
        }).new();
        var o4 = extendsClass(o1, o2);
        var o5 = extendsClass(o1, o3);
        var o6 = extendsClass(o2, o3);

        it('positive', function () {
            assert.equal(true, extendsClass.isWrappedObject(o1));
            assert.equal(true, extendsClass.isWrappedObject(o2));
            assert.equal(true, extendsClass.isWrappedObject(o3));
            assert.equal(true, extendsClass.isWrappedObject(o4));
            assert.equal(true, extendsClass.isWrappedObject(o6));
            assert.equal(true, extendsClass.isWrappedClass(o5));
        });

        it('negative', function () {
            negativeIs('isWrappedClass');
        });
    });

    describe('#isParentClass, isChildClass', function () {

        var C1 = {};
        var C2 = extendsClass({}, function () {
        });
        var C3 = extendsClass({}, function () {
        });
        var C4 = extendsClass(function () {
        }, function () {
        });

        var C5 = extendsClass(C1, C2);
        var C6 = extendsClass(C2, C3);

        var C7 = extendsClass(C4, C5);
        var C8 = extendsClass(C5, C4);

        var C9 = extendsClass(C2, C8);
        var C10 = extendsClass(C8, C2);

        var C11 = extendsClass(C3, C10);
        var C12 = extendsClass(C10, C3);

        var C13 = extendsClass(C4, C12);
        var C14 = extendsClass(C12, C4);

        var parent2child = [
            [1, 5],
            [2, 6],
            [4, 7],
            [5, 8],
            [2, 9],
            [8, 10],
            [3, 11],
            [10, 12],
            [4, 13],
            [12, 14]
        ];
        var isParent = function (parent, child) {
            for (var i = 0; i < parent2child.length; i++) {
                var _ = parent2child[i];
                var p = _[0];
                var c = _[1];
                if (p == parent) {
                    if (c == child) {
                        return true;
                    } else {
                        if (c != parent && isParent(c, child)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        var isChild = function (parent, child) {
            for (var i = 0; i < parent2child.length; i++) {
                var _ = parent2child[i];
                var p = _[0];
                var c = _[1];
                if (p == parent) {
                    if (c == child) {
                        return true;
                    } else {
                        if (c != parent && isParent(c, child)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        var CL = [];
        for (var i = 1; i <= 14; i++) {
            var c = eval('C' + i);
            c.xname = 'C' + i;
            CL.push(c);
        }

        it('parent', function () {

            for (var i = 1; i <= CL.length; i++) {
                for (var j = 1; j <= CL.length; j++) {
                    var relation = isParent(i, j);
                    var executed = extendsClass.isParentClass(CL[j - 1], CL[i - 1]);
                    if (relation != executed) {
                        debugger;
                    }
                    assert.equal(relation, executed);
                }
            }

        });

        it('child', function () {

            for (var i = 1; i <= CL.length; i++) {
                for (var j = 1; j <= CL.length; j++) {
                    var relation = isChild(i, j);
                    var executed = extendsClass.isChildClass(CL[i - 1], CL[j - 1]);
                    if (relation != executed) {
                        debugger;
                    }
                    assert.equal(relation, executed);
                }
            }

        });

    });

    describe('#isInstanceOf', function () {

        var C1 = extendsClass({}, {});
        var C2 = extendsClass({}, function () {
        });
        var C3 = extendsClass(function () {
        }, function () {
        });
        var C4 = extendsClass(C1, C2);
        var C5 = extendsClass(C1, C3);
        var C6 = extendsClass(C2, C3);

        var o1 = C1.new();
        var o2 = C2.new();
        var o3 = C3.new();
        var o4 = C4.new();
        var o5 = C5.new();
        var o6 = C6.new();

        it('main', function () {
            for (var i = 1; i <= 6; i++) {
                for (var j = 1; j <= 6; j++) {
                    var relation = i == j || (i == 4 && j == 1) || (i == 5 && j == 1) || (i == 6 && j == 2);
                    var executed = extendsClass.isInstanceOf(eval('o' + i), eval('C' + j));
                    if (relation != executed) {
                        debugger;
                    }
                    assert.equal(relation, executed);
                }
            }
        })
    })

});
