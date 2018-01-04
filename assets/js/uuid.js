define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Uuid = (function () {
        function Uuid() {
        }
        Uuid.v4 = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
        return Uuid;
    }());
    exports.Uuid = Uuid;
});
//# sourceMappingURL=uuid.js.map