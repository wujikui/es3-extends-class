# es3-extends-class
Extends classes as perfect as possible for ES3(JavaScript 1.5)

## Features

Extends function-class to function-class, object-class to function-class, object-class to class-object.

Based on **dynamic prototype**, function-class extension supports to `instanceof` parent class type and child class type.
  
Implements by **prototype boxing**, object-class can inherits from another object.

## Installation

Download js file([releases page](https://github.com/wujikui/es3-extends-class/releases)) and add it to your project requirement manually.

Supports AMD / CMD / CommonJS / NodeJS / window global object.

## Usages

1. function-class to function-class

    ```javascript
    
    var extendsClass = require('..../extends-class.js');
    
    var ParentClass = function (x, y) {
        this.x = x;
        this.y = y;
    };
    
    var ChildClass1Definition = function (x, y) {
    };
    ChildClass1Definition.prototype = {
        print: function () {
            console.log(this.x + ',' + this.y)
        }
    };
    var ChildClass1 = extendsClass(ParentClass, ChildClass1Definition);
    
    var ChildClass2Definition = function (x, y) {
        this.$$reconstruct('x', 'y');
        this.a = a;
        this.b =b;
    };
    ChildClass2Definition.prototype = {
        print: function () {
            this.$$parent.print.apply(this, arguments);
            console.log(this.a + ',' + this.b);
        }
    };
    var ChildClass2 = extendsClass(ChildClass1, ChildClass2Definition);
    
    var obj = ChildClass2.new('a', 'b');
    
    assert.ok(obj instanceof ChildClass2);
    assert.ok(obj instanceof ChildClass1);
    assert.ok(obj instanceof ParentClass);
    assert.ok(obj.constructor === ChildClass2);
    assert.ok(obj.$$parent.constructor == ChildClass1);
    assert.ok(obj.$$parent.$$parent === ParentClass);
    
    ```

2. object-class to object-class

    ```javascript
    
    var extendsClass = require('..../extends-class.js');
    
    var parent = {
        p: 1
    };
    var child = extendsClass(parent, {
        c: 2
    });
    
    assert.ok(child.c === 2);
    assert.ok(child.p === 1);
    parent.x = 666;
    assert.ok(child.x === 666);
    child.y = 1024;
    assert.ok(parent.y === undefined);
    
    ```

3. object-class to object-class 

    ```javascript
    
    var extendsClass = require('..../extends-class.js');
    
    var parent = {
        p: 1
    };
    
    var ChildClass = extendsClass(parent, function () {
        this.c = 2;
    });
    
    var obj = new ChildClass();
    
    assert.ok(obj.c === 2);
    assert.ok(obj.p === 1);
    parent.x = 666;
    assert.ok(obj.x === 666);
    
    ```

## API

- external API

    ```javascript
    
    function extendsClass (parentType, childType) {
        newType.new = function() {
            // for function-class to class, `new operator` is not allowed, uses instead of `new` function.
            // for others pattern, new function works fine.
            return instanceObject;
        }
        return newType; // [Object|Function]
    }
    
    extendsClass.isWrappedClass = function (type) {
        return true | false;
    };
    extendsClass.isWrappedObject = function (obj) {
        return true | false;
    };
    extendsClass.isParentClass = function (type, parentClass) {
        return true | false;
    };
    extendsClass.isChildClass = function (type, childClass) {
        return true | false;
    };
    extendsClass.isInstanceOf = function (obj, type) {
        return true | false;
    };
    
    ```

- instance API

    - `this.$$parent`[`object`] references to parent instance
    - `this.$$reconstruct`[`function`] apply parent's constructor in current type's constructor
    - `this.$$isReconstructing`[`boolean`] indicates invoking constructor context is default constructor's context or reconstruct's context

- JavaScript type API

    - `this.constructor` references to current Type
    - `this.constructor.prototype` references to current Type's prototype
    - `this.$$parent.constructor` references to parent's Type
    - `this.$$parent.constructor.prototype` references to parent Type's prototype

## Building project

    ```bash
    npm install
    npm run build
    npm run test
    ```

## Test

cover 90%+

## License

[MIT](https://github.com/wujikui/es3-extends-class/blob/master/LICENSE)
