(function () {

    /*
     * include module
     */
    var exportModule = new function () {
        return // @include ./extendsClass.js
    }();

    /*
     * module info
     */
    exportModule.NAME = '/* @echo pkg.title */';
    exportModule.VERSION = '/* @echo pkg.version */';

    /*
     * exports module
     */
    /* eslint-disable */
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        // AMD / CMD
        define(function () {
            return exportModule
        });
    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
        // CommonJS / NodeJS
        module.exports = exportModule;
    } else {
        // window
        this[exportModule.NAME] = exportModule;
    }
    /* eslint-enable */

}).call(this || (typeof window !== 'undefined' ? window : global));
