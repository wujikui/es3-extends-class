const assert = require('assert');
const extendsObject = require('../dist/extends-object.js');

describe('Api', function () {

    function negativeIs(action) {
        assert.equal(false, extendsObject[action](undefined));
        assert.equal(false, extendsObject[action](true));
        assert.equal(false, extendsObject[action](false));
        assert.equal(false, extendsObject[action](''));
        assert.equal(false, extendsObject[action]('string'));
        assert.equal(false, extendsObject[action](-1));
        assert.equal(false, extendsObject[action](0));
        assert.equal(false, extendsObject[action](1));
        assert.equal(false, extendsObject[action]({}));
        assert.equal(false, extendsObject[action](null));
        assert.equal(false, extendsObject[action](new Object()));
        assert.equal(false, extendsObject[action](function () {
        }));
        assert.equal(false, extendsObject[action](this));
        assert.equal(false, extendsObject[action](global));
    }

    describe('#isWrappedClass', function () {

        var C1 = extendsObject({}, {});
        var C2 = extendsObject({}, function () {
        });
        var C3 = extendsObject(function () {
        }, function () {
        });
        var C4 = extendsObject(C1, C2);
        var C5 = extendsObject(C1, C3);
        var C6 = extendsObject(C2, C3);

        it('positive', function () {
            assert.equal(true, extendsObject.isWrappedClass(C1));
            assert.equal(true, extendsObject.isWrappedClass(C2));
            assert.equal(true, extendsObject.isWrappedClass(C3));
            assert.equal(true, extendsObject.isWrappedClass(C4));
            assert.equal(true, extendsObject.isWrappedClass(C5));
            assert.equal(true, extendsObject.isWrappedClass(C6));
        });

        it('negative', function () {
            negativeIs('isWrappedClass');
        });
    });

    describe('#isWrappedObject', function () {

        var o1 = extendsObject({}, {});
        var o2 = new (extendsObject({}, function () {
        }))();
        var o3 = extendsObject(function () {
        }, function () {
        }).new();
        var o4 = extendsObject(o1, o2);
        var o5 = extendsObject(o1, o3);
        var o6 = extendsObject(o2, o3);

        it('positive', function () {
            assert.equal(true, extendsObject.isWrappedObject(o1));
            assert.equal(true, extendsObject.isWrappedObject(o2));
            assert.equal(true, extendsObject.isWrappedObject(o3));
            assert.equal(true, extendsObject.isWrappedObject(o4));
            assert.equal(true, extendsObject.isWrappedObject(o6));
            assert.equal(true, extendsObject.isWrappedClass(o5));
        });

        it('negative', function () {
            negativeIs('isWrappedClass');
        });
    });

    describe('#isParentClass, isChildClass', function () {

        var C1 = {};
        var C2 = extendsObject({}, function () {
        });
        var C3 = extendsObject({}, function () {
        });
        var C4 = extendsObject(function () {
        }, function () {
        });

        var C5 = extendsObject(C1, C2);
        var C6 = extendsObject(C2, C3);

        var C7 = extendsObject(C4, C5);
        var C8 = extendsObject(C5, C4);

        var C9 = extendsObject(C2, C8);
        var C10 = extendsObject(C8, C2);

        var C11 = extendsObject(C3, C10);
        var C12 = extendsObject(C10, C3);

        var C13 = extendsObject(C4, C12);
        var C14 = extendsObject(C12, C4);

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
                    var executed = extendsObject.isParentClass(CL[j - 1], CL[i - 1]);
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
                    var executed = extendsObject.isChildClass(CL[i - 1], CL[j - 1]);
                    if (relation != executed) {
                        debugger;
                    }
                    assert.equal(relation, executed);
                }
            }

        });

    });

    describe('#isInstanceOf', function () {

        var C1 = extendsObject({}, {});
        var C2 = extendsObject({}, function () {
        });
        var C3 = extendsObject(function () {
        }, function () {
        });
        var C4 = extendsObject(C1, C2);
        var C5 = extendsObject(C1, C3);
        var C6 = extendsObject(C2, C3);

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
                    var executed = extendsObject.isInstanceOf(eval('o' + i), eval('C' + j));
                    if (relation != executed) {
                        debugger;
                    }
                    assert.equal(relation, executed);
                }
            }
        })
    })

});
