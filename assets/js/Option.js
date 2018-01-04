define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OptionValueLabel = (function () {
        function OptionValueLabel(value, label) {
            this.value = '';
            this.label = '';
            this.value = value;
            this.label = label;
        }
        return OptionValueLabel;
    }());
    exports.OptionValueLabel = OptionValueLabel;
    var Option = (function () {
        function Option(id, type, label, value, values) {
            if (type === void 0) { type = 'text'; }
            if (label === void 0) { label = null; }
            if (values === void 0) { values = null; }
            this.id = '';
            this.type = 'text';
            this.id = id;
            this.type = type;
            this.value = value;
            this.values = values;
            if (label == null) {
                this.label = id;
            }
            else
                this.label = label;
        }
        return Option;
    }());
    exports.Option = Option;
});
//# sourceMappingURL=Option.js.map