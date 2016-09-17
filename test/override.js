const assert = require('assert');
const extendsClass = require('../dist/extends-class.js');

describe('Override', function () {

    describe('#1', function () {

        var PersonClass = function (name, age, height) {
            this.name = name;
            this.age = age;
            this.height = height;
        };
        PersonClass.prototype = {
            constructor: PersonClass,
            eat: function () {
                return this.name + ' eats somethings';
            },
            run: function (distance) {
                return this.name + ' runs ' + distance;
            }
        };

        var ManClass = function (name, age) {
            this.$$reconstruct(name, age, '180cm');
            this.name += '♂';
            this.game = 'WOW';
        };
        ManClass.prototype = {
            constructor: ManClass,
            favor: 'football',
            run: function (distance) {
                return this.$$parent.run.call(this, distance) + ' and playing ' + this.favor;
            }
        };
        ManClass = extendsClass(PersonClass, ManClass);

        var WomanClass = function (name, height, hair) {
            this.$$reconstruct(name, 18, height);
            this.name += '♀';
            this.hair = hair;
            this.run = function (distance) {
                return PersonClass.prototype.run.call(this, distance) + ' as ' + this.job;
            }
        };
        WomanClass.prototype = {
            constructor: WomanClass,
            job: 'dreamer',
            makeup: function () {
                return this.name + ' makes up';
            }
        };
        WomanClass = extendsClass(PersonClass, WomanClass);

        var man1 = ManClass.new('Alex', 16);
        var man2 = ManClass.new('Devin', 24);
        var woman1 = WomanClass.new('Julie', '160cm', 'red');
        var woman2 = WomanClass.new('Rafael', '171cm', 'brown');

        it('inherit', function () {
            assert.equal('string', typeof ManClass.prototype.favor);
            assert.equal('undefined', typeof ManClass.prototype.makeup);
            assert.equal('undefined', typeof WomanClass.prototype.favor);
            assert.equal('function', typeof WomanClass.prototype.makeup);
        });

        it('inherit instance', function () {
            assert.equal('string', typeof man1.game);
            assert.equal('string', typeof man2.game);
            assert.equal('undefined', typeof woman1.game);
            assert.equal('undefined', typeof woman2.game);
            assert.equal('undefined', typeof man1.hair);
            assert.equal('undefined', typeof man2.hair);
            assert.equal('string', typeof woman1.hair);
            assert.equal('string', typeof woman2.hair);
        });

        it('override', function () {
            assert.equal('Alex♂ runs 1km and playing football', man1.run('1km'));
            assert.equal('Alex runs 2km', man1.$$parent.run('2km'));
            assert.equal('Alex♂ runs 3km and playing football', ManClass.prototype.run.call(man1, '3km'));
            assert.equal('Alex♂ runs 4km', PersonClass.prototype.run.call(man1, '4km'));
            assert.equal('Julie♀ runs 1km as dreamer', woman1.run('1km'));
            assert.equal('Julie runs 2km', woman1.$$parent.run('2km'));
            assert.equal('Julie♀ runs 3km', WomanClass.prototype.run.call(woman1, '3km'));
            assert.equal('Julie♀ runs 4km', PersonClass.prototype.run.call(woman1, '4km'));
        });

    });

    describe('#2', function () {

        var parent = {
            a: 1,
            b: 2
        };
        var child = extendsClass(parent, {
            a: 2,
            c: 3
        });

        it('main', function () {
            assert.equal(1, parent.a);
            assert.equal(2, parent.b);
            assert.equal(2, child.a);
            assert.equal(2, child.b);
            assert.equal(3, child.c);
        });

        it('modify', function () {
            parent.a = 'a';
            parent.b = 'b';
            parent.d = 'd';
            child.a = 'a-child';
            child.c = 'c-child';
            child.e = 'e';
            assert.equal('a', parent.a);
            assert.equal('b', parent.b);
            assert.equal(undefined, parent.c);
            assert.equal('d', parent.d);
            assert.equal(undefined, parent.e);
            assert.equal('a-child', child.a);
            assert.equal('b', child.b);
            assert.equal('c-child', child.c);
            assert.equal('d', child.d);
            assert.equal('e', child.e);
        });

    });

});
