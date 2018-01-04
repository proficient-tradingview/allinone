define(["require", "exports", "../uuid"], function (require, exports, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Module = (function () {
        function Module() {
            this.type = 'tradingview';
            this.uid = uuid_1.Uuid.v4();
        }
        Module.prototype.getLink = function () { return null; };
        Module.prototype.update = function (config) { };
        Module.getOptions = function () {
            return [];
        };
        Module.prototype.setOption = function (option) { };
        Module.prototype.setOptions = function (options, refresh) {
            if (refresh === void 0) { refresh = true; }
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var option = options_1[_i];
                this.setOption(option);
            }
        };
        return Module;
    }());
    exports.Module = Module;
});
//# sourceMappingURL=Module.js.map