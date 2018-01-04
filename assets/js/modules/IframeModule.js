var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./Module", "../Option"], function (require, exports, Module_1, Option_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IframeModule = (function (_super) {
        __extends(IframeModule, _super);
        function IframeModule(options) {
            if (options === void 0) { options = []; }
            var _this = _super.call(this) || this;
            _this.type = 'iframe';
            _this.setOptions(options, false);
            return _this;
        }
        IframeModule.getOptions = function () {
            return [
                new Option_1.Option('href', 'text', 'URL', 'https://quickfingerstraders.slack.com'),
            ];
        };
        IframeModule.prototype.setOption = function (option) {
            if (option.id == 'href')
                this.href = option.value;
        };
        IframeModule.prototype.update = function (config) {
            var options = 'options';
            $('#' + this.uid + '-content').html('<iframe src="' + this.href + '" ' + options + ' style="width:100%;height:100%">Tweets</iframe>');
        };
        return IframeModule;
    }(Module_1.Module));
    exports.IframeModule = IframeModule;
});
//# sourceMappingURL=IframeModule.js.map