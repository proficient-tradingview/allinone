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
    var TradingModule = (function (_super) {
        __extends(TradingModule, _super);
        function TradingModule(options) {
            if (options === void 0) { options = []; }
            var _this = _super.call(this) || this;
            _this.symbol = TradingModule.defaultSymbol;
            _this.theme = TradingModule.defaultTheme;
            _this.interval = TradingModule.defaultInterval;
            _this.timezone = TradingModule.defaultTimezone;
            _this.hideTopbar = TradingModule.defaultHideTopbar;
            _this.hideSidebar = TradingModule.defaultHideSidebar;
            _this.style = TradingModule.defaultHideSidebar;
            _this.allowSymbolChange = TradingModule.defaultAllowSymbolChange;
            _this.saveImage = TradingModule.defaultSaveImage;
            _this.refreshInterval = 0;
            _this.type = 'tradingview';
            _this.setOptions(options, false);
            return _this;
        }
        TradingModule.prototype.exportToJson = function () {
            return {
                type: this.type,
                uid: this.uid,
                symbol: this.symbol,
                theme: this.theme,
                interval: this.interval,
                timezone: this.timezone,
                hideTopbar: this.hideTopbar,
                hideSidebar: this.hideSidebar,
                style: this.style,
                allowSymbolChange: this.allowSymbolChange,
                saveImage: this.saveImage,
            };
        };
        TradingModule.prototype.getLink = function () {
            if (this.symbol.indexOf('BINANCE:') === 0) {
                var currencies = this.symbol.replace('BINANCE:', '');
                return 'https://www.binance.com/tradeDetail.html?symbol=' + currencies.substring(0, 3) + '_' + currencies.substring(3);
            }
            else {
                return 'https://www.tradingview.com/chart/?symbol=' + this.symbol;
            }
        };
        TradingModule.prototype.destroy = function () {
            if (this.refreshInterval)
                clearInterval(this.refreshInterval);
        };
        TradingModule.getOptions = function () {
            return [
                new Option_1.Option('symbol', 'text', 'Symbol', TradingModule.defaultSymbol),
                new Option_1.Option('theme', 'select', 'Theme', TradingModule.defaultTheme, [new Option_1.OptionValueLabel('Dark', 'Dark'), new Option_1.OptionValueLabel('Light', 'Light')]),
                new Option_1.Option('timezone', 'select', 'Timezone', TradingModule.defaultTimezone, [
                    new Option_1.OptionValueLabel('Etc/UTC', 'UTC'),
                    new Option_1.OptionValueLabel('exchange', 'Exchange'),
                    new Option_1.OptionValueLabel('Pacific/Honolulu', '(UTC-10) Honolulu'),
                    new Option_1.OptionValueLabel('America/Los_Angeles', '(UTC-8) Los Angeles'),
                    new Option_1.OptionValueLabel('America/Vancouver', '(UTC-8) Vancouver'),
                    new Option_1.OptionValueLabel('America/Phoenix', '(UTC-7) Phoenix'),
                    new Option_1.OptionValueLabel('America/Chicago', '(UTC-6) Chicago'),
                    new Option_1.OptionValueLabel('America/Mexico_City', '(UTC-6) Mexico City'),
                    new Option_1.OptionValueLabel('America/El_Salvador', '(UTC-6) San Salvador'),
                    new Option_1.OptionValueLabel('America/Bogota', '(UTC-5) Bogota'),
                    new Option_1.OptionValueLabel('America/New_York', '(UTC-5) New York'),
                    new Option_1.OptionValueLabel('America/Toronto', '(UTC-5) Toronto'),
                    new Option_1.OptionValueLabel('America/Caracas', '(UTC-4) Caracas'),
                    new Option_1.OptionValueLabel('America/Argentina/Buenos_Aires', '(UTC-3) Buenos Aires'),
                    new Option_1.OptionValueLabel('America/Sao_Paulo', '(UTC-2) Sao Paulo'),
                    new Option_1.OptionValueLabel('Europe/London', '(UTC) London'),
                    new Option_1.OptionValueLabel('Europe/Belgrade', '(UTC+1) Belgrade'),
                    new Option_1.OptionValueLabel('Europe/Berlin', '(UTC+1) Berlin'),
                    new Option_1.OptionValueLabel('Europe/Paris', '(UTC+1) Paris'),
                    new Option_1.OptionValueLabel('Europe/Athens', '(UTC+2) Athens'),
                ]),
                new Option_1.Option('interval', 'select', 'Interval', TradingModule.defaultInterval, [
                    new Option_1.OptionValueLabel('1', '1 min'),
                    new Option_1.OptionValueLabel('3', '3 min'),
                    new Option_1.OptionValueLabel('5', '5 min'),
                    new Option_1.OptionValueLabel('15', '15 min'),
                    new Option_1.OptionValueLabel('30', '30 min'),
                    new Option_1.OptionValueLabel('60', '1 hour'),
                    new Option_1.OptionValueLabel('120', '2 hours'),
                    new Option_1.OptionValueLabel('180', '3 hours'),
                    new Option_1.OptionValueLabel('240', '4 hours'),
                    new Option_1.OptionValueLabel('D', '1D'),
                    new Option_1.OptionValueLabel('W', '1W'),
                ]),
                new Option_1.Option('style', 'select', 'Style', TradingModule.defaultStyle, [
                    new Option_1.OptionValueLabel('0', 'Bar'),
                    new Option_1.OptionValueLabel('1', 'Candle'),
                    new Option_1.OptionValueLabel('9', 'Hollow candle'),
                    new Option_1.OptionValueLabel('8', 'Heilkin Ashi'),
                    new Option_1.OptionValueLabel('2', 'Line'),
                    new Option_1.OptionValueLabel('3', 'Area'),
                    new Option_1.OptionValueLabel('4', 'Renko'),
                    new Option_1.OptionValueLabel('7', 'Line-break'),
                    new Option_1.OptionValueLabel('5', 'Kagi'),
                    new Option_1.OptionValueLabel('6', 'Point and figures'),
                ]),
                new Option_1.Option('hideTopbar', 'check', 'Hide top bar', TradingModule.defaultHideTopbar),
                new Option_1.Option('hideSidebar', 'check', 'Hide side bar', TradingModule.defaultHideSidebar),
                new Option_1.Option('saveImage', 'check', 'Save image button', TradingModule.defaultSaveImage),
                new Option_1.Option('allowSymbolChange', 'check', 'Allow symbol change (not saved when modifying after inserting)', TradingModule.defaultAllowSymbolChange),
            ];
        };
        TradingModule.prototype.setOption = function (option) {
            if (option.id in this)
                this[option.id] = option.value;
        };
        TradingModule.prototype.update = function (config) {
            this.destroy();
            var self = this;
            $('#' + this.uid + '-content').attr('style', function (i, s) { return s + 'overflow: hidden !important;'; });
            var options = {
                "container_id": this.uid + '-content',
                "autosize": true,
                "symbol": this.symbol,
                "interval": this.interval,
                "timezone": this.timezone,
                "theme": this.theme,
                "style": this.style,
                "locale": navigator.language || 'en',
                // "toolbar_bg": config.backgroundColor,
                // "toolbar_bg": this.hexToRgbA(config.backgroundColor),
                "enable_publishing": false,
                "allow_symbol_change": this.allowSymbolChange,
                "show_popup_button": false,
                "hideideas": true,
            };
            console.log(config.backgroundColor);
            if (this.hideTopbar)
                options['hide_top_toolbar'] = true;
            else
                options['hide_top_toolbar'] = false;
            if (!this.hideSidebar)
                options['hide_side_toolbar'] = false;
            if (!this.saveImage)
                options['save_image'] = false;
            var element = new TradingView.widget(options);
            console.log(element);
            element.ready(function () {
                self.refreshInterval = setInterval(function () {
                    element.getSymbolInfo(function (data) {
                        self.symbol = data.exchange + ':' + data.name;
                        self.interval = data.interval;
                    });
                }, 1000);
                // element.subscribeToQuote(function(data){
                // 	console.log('subscribeToQuote',data);
                // });
            });
        };
        TradingModule.prototype.hexToRgbA = function (hex) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                var c2 = hex.substring(1).split('');
                if (c2.length == 3) {
                    c2 = [c2[0], c2[0], c2[1], c2[1], c2[2], c2[2]];
                }
                c = ('0x' + c2.join(''));
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
            }
            throw new Error('Bad Hex');
        };
        TradingModule.defaultSymbol = 'BINANCE:BTCUSDT';
        TradingModule.defaultTheme = 'Dark';
        TradingModule.defaultInterval = '60';
        TradingModule.defaultTimezone = 'Etc/UTC';
        TradingModule.defaultHideTopbar = false;
        TradingModule.defaultHideSidebar = false;
        TradingModule.defaultAllowSymbolChange = false;
        TradingModule.defaultSaveImage = false;
        TradingModule.defaultStyle = '1';
        return TradingModule;
    }(Module_1.Module));
    exports.TradingModule = TradingModule;
});
//# sourceMappingURL=TradingViewModule.js.map