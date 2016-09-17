const assert = require('assert');

describe('Main', function () {
    describe('#mocha()', function () {
        // assert.ok(true);
        it('check mocha installation', function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });
    describe('#module()', function () {
        const module = require('../dist/extends-class.min.js');
        it('check building module', function () {
            assert(module && module.VERSION)
        });
    });
});
