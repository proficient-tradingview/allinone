define(["require", "exports", "./TradingViewModule", "./IframeModule", "./TwitterModule"], function (require, exports, TradingViewModule_1, IframeModule_1, TwitterModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ModuleFactory = (function () {
        function ModuleFactory() {
        }
        ModuleFactory.newModuleFromType = function (type) {
            if (type === 'tradingview') {
                return new TradingViewModule_1.TradingModule();
            }
            else if (type === 'iframe') {
                return new IframeModule_1.IframeModule();
            }
            else if (type === 'twitter') {
                return new TwitterModule_1.TwitterModule();
            }
            else
                return new IframeModule_1.IframeModule();
        };
        ModuleFactory.optionsFromType = function (type) {
            if (type == 'tradingview')
                return TradingViewModule_1.TradingModule.getOptions();
            if (type == 'twitter')
                return TwitterModule_1.TwitterModule.getOptions();
            if (type == 'iframe')
                return IframeModule_1.IframeModule.getOptions();
            return [];
        };
        return ModuleFactory;
    }());
    exports.ModuleFactory = ModuleFactory;
});
//# sourceMappingURL=ModuleFactory.js.map