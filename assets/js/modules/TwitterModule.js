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
    var TwitterModule = (function (_super) {
        __extends(TwitterModule, _super);
        function TwitterModule(options) {
            if (options === void 0) { options = []; }
            var _this = _super.call(this) || this;
            _this.type = 'twitter';
            _this.setOptions(options, false);
            return _this;
        }
        TwitterModule.getOptions = function () {
            return [
                new Option_1.Option('ref', 'text', 'Symbol', 'https://twitter.com/Capetlevrai'),
                new Option_1.Option('theme', 'select', 'Theme', 'Dark', [new Option_1.OptionValueLabel('Dark', 'Dark'), new Option_1.OptionValueLabel('Light', 'Light')])
            ];
        };
        TwitterModule.prototype.setOption = function (option, refresh) {
            if (refresh === void 0) { refresh = true; }
            if (option.id == 'ref')
                this.ref = option.value;
            if (option.id == 'theme')
                this.theme = option.value;
            console.log(option.value);
            if (refresh)
                this.update();
        };
        TwitterModule.prototype.update = function () {
            console.log('refresh');
            console.log(this.ref);
            var options = '';
            if (this.theme == 'Dark')
                options += ' data-theme="dark"';
            $('#' + this.uid + '-content').html('<a class="twitter-timeline" href="' + this.ref + '" ' + options + '>Tweets</a>');
            twttr.widgets.load(document.getElementById(this.uid + '-content'));
        };
        return TwitterModule;
    }(Module_1.Module));
    exports.TwitterModule = TwitterModule;
});
//# sourceMappingURL=TwitterModule.js.map