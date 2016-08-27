"use strict";
;
exports.build = function () {
    var Wrapper = (function () {
        function Wrapper(context) {
            this.value = context;
        }
        return Wrapper;
    }());
    var prototype = Wrapper.prototype;
    var result = {
        value: function (context) { return new Wrapper(context); },
        cascade: function (name, func) {
            prototype[name] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                func.apply(void 0, args)(this.value);
                return this;
            };
            return result;
        },
        chain: function (name, func) {
            prototype[name] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                this.value = func.apply(void 0, args)(this.value);
                return this;
            };
            return result;
        },
        unbox: function (name, func) {
            prototype[name] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return func.apply(void 0, args)(this.value);
            };
            return result;
        }
    };
    return result;
};
//# sourceMappingURL=index.js.map