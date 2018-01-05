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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "./VueAnnotate", "./modules/TradingViewModule", "./modules/TwitterModule", "./modules/IframeModule", "./Utils", "./modules/ModuleFactory", "./Configuration"], function (require, exports, VueAnnotate_1, TradingViewModule_1, TwitterModule_1, IframeModule_1, Utils_1, ModuleFactory_1, Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Cell = (function () {
        function Cell() {
            this.used = false;
            this.moduleUid = null;
            this.full = false;
            this.size = { x: 1, y: 1 };
        }
        return Cell;
    }());
    var App = (function (_super) {
        __extends(App, _super);
        function App(containerName, vuejsDataConstructor) {
            if (vuejsDataConstructor === void 0) { vuejsDataConstructor = ''; }
            var _this = _super.call(this, vuejsDataConstructor) || this;
            _this.grid = [];
            _this.gridWidth = 2;
            _this.gridHeight = 2;
            _this.gridMaxWidth = 10;
            _this.gridMaxHeight = 10;
            _this.modules = [];
            _this.currentOptions = [];
            _this.newModuleType = 'tradingview';
            _this.editable = false;
            _this.intervalSaveCurrentConfig = 0;
            var self = _this;
            _this.configuration = new Configuration_1.Configuration();
            var params = Utils_1.default.getSearchParameters();
            console.log(params);
            if (typeof params.chart !== 'undefined') {
                _this.buildCompatMultichat(params.chart);
            }
            else if ("data" in params) {
                _this.buildFromData(atob(params.data));
            }
            else if ("default" in params) {
                _this.buildDefault(params.default);
            }
            else {
                _this.editable = true;
                _this.recalculateGrid();
            }
            _this.initDragAndDrop();
            //start auto backup to url : save modules parameters if they change
            _this.intervalSaveCurrentConfig = setInterval(function () {
                self.exportToUrl(true);
            }, 2000);
            return _this;
        }
        App.prototype.initDragAndDrop = function () {
            var counter = 0;
            var appContainer = $('body');
            appContainer.on('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (typeof e.dataTransfer !== 'undefined' && "dropEffect" in e.dataTransfer)
                    e.dataTransfer.dropEffect = 'copy';
                $('.dropHereToLoad').show();
            });
            var self = this;
            appContainer.on('drop', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var dt = e.originalEvent.dataTransfer;
                if (dt.items) {
                    var _loop_1 = function (i) {
                        if (dt.items[i].kind == "file") {
                            var f = dt.items[i].getAsFile();
                            var reader_1 = new FileReader();
                            reader_1.onload = (function (theFile) {
                                return function (e) {
                                    self.buildFromData(reader_1.result);
                                };
                            })(f);
                            reader_1.readAsText(f);
                        }
                    };
                    for (var i = 0; i < dt.items.length; i++) {
                        _loop_1(i);
                    }
                }
                else {
                    var _loop_2 = function (i) {
                        var reader = new FileReader();
                        reader.onload = (function (theFile) {
                            return function (e) {
                                self.buildFromData(reader.result);
                            };
                        })(dt.files[i]);
                        reader.readAsText(dt.files[i]);
                    };
                    for (var i = 0; i < dt.files.length; i++) {
                        _loop_2(i);
                    }
                }
                $('.dropHereToLoad').hide();
                counter = 0;
            });
            appContainer.on('dragenter', function (e) {
                ++counter;
            });
            appContainer.on('dragleave', function (e) {
                --counter;
                if (counter == 0) {
                    $('.dropHereToLoad').hide();
                }
            });
        };
        App.prototype.openSidebar = function () {
            $('#app .ui.labeled.icon.sidebar')
                .sidebar({
                context: '#app'
            })
                .sidebar('toggle');
        };
        App.prototype.toggleEdit = function (openSidebar) {
            if (openSidebar === void 0) { openSidebar = true; }
            this.editable = !this.editable;
            if (openSidebar)
                this.openSidebar();
        };
        App.prototype.cellClick = function (cell) {
            if (!cell.used) {
                var self_1 = this;
                $('#newModuleModal')
                    .modal({
                    onDeny: function () {
                    },
                    onApprove: function () {
                        var newModule = null;
                        if (self_1.newModuleType == 'tradingview')
                            newModule = new TradingViewModule_1.TradingModule(self_1.currentOptions);
                        if (self_1.newModuleType == 'twitter')
                            newModule = new TwitterModule_1.TwitterModule(self_1.currentOptions);
                        if (self_1.newModuleType == 'iframe')
                            newModule = new IframeModule_1.IframeModule(self_1.currentOptions);
                        if (newModule !== null) {
                            console.log('updated');
                            cell.used = true;
                            cell.moduleUid = newModule.uid;
                            self_1.modules.push(newModule);
                            self_1.$nextTick(function () {
                                if (newModule !== null)
                                    newModule.update(self_1.configuration);
                                // self.updateAll();
                            });
                            self_1.exportToUrl();
                        }
                    }
                })
                    .modal('show');
            }
        };
        App.prototype.updateAll = function () {
            console.log(this.modules);
            for (var _i = 0, _a = this.modules; _i < _a.length; _i++) {
                var module = _a[_i];
                console.log(module);
                module.update(this.configuration);
            }
        };
        App.prototype.showSettings = function () {
            var self = this;
            var oldGridSize = {
                width: this.gridWidth,
                height: this.gridHeight
            };
            $('#settingsModal')
                .modal({
                onDeny: function () {
                },
                onApprove: function () {
                    if (self.gridWidth !== oldGridSize.width ||
                        self.gridHeight !== oldGridSize.height) {
                        self.recalculateGrid(true);
                        self.editable = true;
                    }
                    self.exportToUrl();
                }
            })
                .modal('show');
        };
        App.prototype.showRoadmap = function () {
            $('#roadmapModal')
                .modal('show');
        };
        App.prototype.destroyAllModules = function () {
            for (var _i = 0, _a = this.modules; _i < _a.length; _i++) {
                var module = _a[_i];
                module.destroy();
            }
            this.modules = [];
        };
        App.prototype.recalculateGrid = function (clearGrid, clearModules) {
            if (clearGrid === void 0) { clearGrid = false; }
            if (clearModules === void 0) { clearModules = false; }
            if (clearModules) {
                this.destroyAllModules();
            }
            if (clearGrid) {
                this.grid = [];
            }
            this.$forceUpdate();
            for (var i = 0; i < this.gridHeight; ++i) {
                var cells = [];
                for (var j = 0; j < this.gridWidth; ++j) {
                    cells.push(new Cell());
                }
                this.grid.push(cells);
            }
        };
        App.prototype.newModuleTypeWatch = function () {
            var self = this;
            console.log('change options');
            if (this.newModuleType == 'tradingview')
                this.currentOptions = TradingViewModule_1.TradingModule.getOptions();
            if (this.newModuleType == 'twitter')
                this.currentOptions = TwitterModule_1.TwitterModule.getOptions();
            if (this.newModuleType == 'iframe')
                this.currentOptions = IframeModule_1.IframeModule.getOptions();
            this.currentOptions = ModuleFactory_1.ModuleFactory.optionsFromType(this.newModuleType);
            this.$nextTick(function () {
                $('#app .ui.checkbox').checkbox();
            });
        };
        App.prototype.buildCompatMultichat = function (charts) {
            var self = this;
            var perLine = 2;
            console.log('----------multicoincharts compat---------');
            if (charts.length > 4)
                perLine = 3;
            if (charts.length > 8)
                perLine = 4;
            if (charts.length > 16)
                perLine = 5;
            console.log('Charts per line' + perLine);
            this.gridHeight = Math.ceil(charts.length / perLine);
            this.gridWidth = perLine;
            console.log('grid height:' + this.gridHeight);
            this.recalculateGrid();
            var xCell = 0;
            var yCell = 0;
            for (var _i = 0, charts_1 = charts; _i < charts_1.length; _i++) {
                var chart = charts_1[_i];
                var module = new TradingViewModule_1.TradingModule();
                module.symbol = chart;
                this.modules.push(module);
                this.grid[yCell][xCell].used = true;
                this.grid[yCell][xCell].moduleUid = module.uid;
                console.log(chart + '->' + module.uid);
                ++xCell;
                if (xCell === perLine) {
                    xCell = 0;
                    ++yCell;
                }
            }
            console.log(this.grid);
            console.log(this.modules);
            this.exportToUrl();
            console.log('-----------------------------------------');
            this.$nextTick(function () {
                console.log('update all');
                self.updateAll();
            });
        };
        App.prototype.buildFromData = function (data) {
            data = JSON.parse(data);
            console.log('Build from data (v:' + data.version + ')');
            if (data.version == 1 || typeof data.version === 'undefined')
                this.buildFromDataV1(data);
        };
        App.prototype.buildFromDataV1 = function (data) {
            var self = this;
            console.log(data);
            this.grid = [];
            this.destroyAllModules();
            for (var _i = 0, _a = data.grid; _i < _a.length; _i++) {
                var row = _a[_i];
                var cells = [];
                for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                    var cellContent = row_1[_b];
                    var cell = new Cell();
                    cell.moduleUid = cellContent.moduleUid;
                    cell.used = cellContent.used;
                    if (typeof cellContent.full !== 'undefined')
                        cell.full = cellContent.full;
                    if (typeof cellContent.size !== 'undefined')
                        cell.size = cellContent.size;
                    cells.push(cell);
                }
                this.grid.push(cells);
            }
            for (var _c = 0, _d = data.modules; _c < _d.length; _c++) {
                var moduleContent = _d[_c];
                var module = ModuleFactory_1.ModuleFactory.newModuleFromType(moduleContent.type);
                if (module !== null) {
                    for (var i in moduleContent) {
                        module[i] = moduleContent[i];
                    }
                    this.modules.push(module);
                }
            }
            if ("configuration" in data) {
                for (var i in data.configuration) {
                    this.configuration[i] = data.configuration[i];
                }
            }
            this.$nextTick(function () {
                console.log('update all');
                self.updateAll();
            });
            this.exportToUrl();
        };
        App.prototype.buildDefault = function (type) {
            if (type === void 0) { type = '$'; }
            console.log('build from default');
            if (type != '$' && type != '€')
                type = '$';
            var self = this;
            this.grid = [];
            this.destroyAllModules();
            this.gridWidth = 2;
            this.gridHeight = 2;
            this.recalculateGrid(true, true);
            if (type == '$') {
                var btcUsdt = new TradingViewModule_1.TradingModule();
                btcUsdt.symbol = 'BINANCE:BTCUSDT';
                this.grid[0][0].moduleUid = btcUsdt.uid;
                this.modules.push(btcUsdt);
                var ltcUsdt = new TradingViewModule_1.TradingModule();
                ltcUsdt.symbol = 'BINANCE:LTCUSDT';
                this.grid[0][1].moduleUid = ltcUsdt.uid;
                this.modules.push(ltcUsdt);
                var ethUsdt = new TradingViewModule_1.TradingModule();
                ethUsdt.symbol = 'BINANCE:ETHUSDT';
                this.grid[1][0].moduleUid = ethUsdt.uid;
                this.modules.push(ethUsdt);
            }
            else if (type == '$') {
                var btcUsdt = new TradingViewModule_1.TradingModule();
                btcUsdt.symbol = 'BITSTAMP:BTCEUR';
                this.grid[0][0].moduleUid = btcUsdt.uid;
                this.modules.push(btcUsdt);
                var ltcUsdt = new TradingViewModule_1.TradingModule();
                ltcUsdt.symbol = 'BITSTAMP:LTCEUR';
                this.grid[0][1].moduleUid = ltcUsdt.uid;
                this.modules.push(ltcUsdt);
                var ethUsdt = new TradingViewModule_1.TradingModule();
                ethUsdt.symbol = 'BITSTAMP:ETHEUR';
                this.grid[1][0].moduleUid = ethUsdt.uid;
                this.modules.push(ethUsdt);
            }
            this.$nextTick(function () {
                console.log('update all');
                self.updateAll();
            });
            this.exportToUrl();
        };
        App.prototype.expandCell = function (cell) {
            cell.full = true;
            this.exportToUrl();
        };
        App.prototype.shortCell = function (cell) {
            cell.full = false;
            this.exportToUrl();
        };
        App.prototype.removeModule = function (cell) {
            for (var iRow = 0; iRow < this.grid.length; ++iRow) {
                for (var iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn) {
                    var searchCell = this.grid[iRow][iColumn];
                    if (searchCell === cell) {
                        for (var x = 0; x < cell.size.x; ++x) {
                            for (var y = 0; y < cell.size.y; ++y) {
                                this.grid[iRow + y][iColumn + x].used = false;
                            }
                        }
                    }
                }
            }
            for (var iModule = 0; iModule < this.modules.length; ++iModule) {
                if (this.modules[iModule].uid == cell.moduleUid) {
                    this.modules[iModule].destroy();
                    this.modules.splice(iModule, 1);
                    break;
                }
            }
            cell.moduleUid = null;
            cell.used = false;
            cell.size.x = 1;
            cell.size.y = 1;
            this.exportToUrl();
        };
        App.prototype.openExternal = function (cell) {
            for (var _i = 0, _a = this.modules; _i < _a.length; _i++) {
                var module = _a[_i];
                if (module.uid === cell.moduleUid) {
                    var link = module.getLink();
                    if (link !== null) {
                        window.open(link, '_blank');
                    }
                    break;
                }
            }
        };
        App.prototype.changeCellSize = function (cell, direction) {
            for (var iRow = 0; iRow < this.grid.length; ++iRow) {
                for (var iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn) {
                    var searchCell = this.grid[iRow][iColumn];
                    if (searchCell === cell) {
                        for (var x = 0; x < cell.size.x; ++x) {
                            for (var y = 0; y < cell.size.y; ++y) {
                                this.grid[iRow + y][iColumn + x].used = false;
                            }
                        }
                    }
                }
            }
            if (direction == 'up') {
                if (cell.size.y > 1)
                    cell.size.y -= 1;
            }
            if (direction == 'left') {
                if (cell.size.x > 1)
                    cell.size.x -= 1;
            }
            if (direction === 'down') {
                for (var iRow = 0; iRow < this.grid.length; ++iRow) {
                    for (var iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn) {
                        var searchCell = this.grid[iRow][iColumn];
                        if (searchCell === cell) {
                            if (iRow + cell.size.y < this.grid.length) {
                                cell.size.y += 1;
                            }
                        }
                    }
                }
            }
            if (direction === 'right') {
                for (var iRow = 0; iRow < this.grid.length; ++iRow) {
                    for (var iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn) {
                        var searchCell = this.grid[iRow][iColumn];
                        if (searchCell === cell) {
                            if (iColumn + cell.size.x < this.grid[iRow].length) {
                                cell.size.x += 1;
                            }
                        }
                    }
                }
            }
            for (var iRow = 0; iRow < this.grid.length; ++iRow) {
                for (var iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn) {
                    var searchCell = this.grid[iRow][iColumn];
                    if (searchCell === cell) {
                        for (var x = 0; x < cell.size.x; ++x) {
                            for (var y = 0; y < cell.size.y; ++y) {
                                this.grid[iRow + y][iColumn + x].used = true;
                            }
                        }
                    }
                }
            }
            this.exportToUrl();
        };
        App.prototype.addToBookmark = function () {
            var bookmarkURL = window.location.href;
            var bookmarkTitle = document.title;
            if ('addToHomescreen' in window && window.addToHomescreen.isCompatible) {
                // Mobile browsers
                window.addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
            }
            else if (window.sidebar && window.sidebar.addPanel) {
                // Firefox version < 23
                window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
            }
            else if (window.external && ('AddFavorite' in window.external)) {
                // IE Favorite
                window.external.AddFavorite(bookmarkURL, bookmarkTitle);
            }
            else {
                // Other browsers (mainly WebKit - Chrome/Safari)
                alert('Please press ' + (/Mac/i.test(navigator.userAgent) ? 'Strg' : 'CMD') + ' + D to add this page to your favorites.');
            }
        };
        App.prototype.export = function () {
            var modules = [];
            for (var _i = 0, _a = this.modules; _i < _a.length; _i++) {
                var module = _a[_i];
                modules.push(module.exportToJson());
            }
            var ojson = {
                version: 1,
                grid: this.grid,
                modules: modules,
                configuration: this.configuration
            };
            var json = JSON.stringify(ojson);
            return json;
        };
        App.prototype.exportToUrl = function (replace) {
            if (replace === void 0) { replace = false; }
            var json = this.export();
            if (replace)
                window.history.replaceState(null, '', '?data=' + btoa(json));
            else
                window.history.pushState(null, '', '?data=' + btoa(json));
        };
        App.prototype.saveConfig = function () {
            var blob = new Blob([this.export()], { type: "application/json;charset=utf-8" });
            saveAs(blob, 'state.json');
        };
        App.prototype.loadConfig = function () {
            var self = this;
            var inputs = $('<input type="file" />');
            inputs.click();
            var input = inputs[0];
            input.addEventListener('change', function (event) {
                var files = input.files; // FileList object
                if (files === null)
                    return;
                console.log(files);
                var _loop_3 = function (i, f) {
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function () {
                            self.buildFromData(reader.result);
                        };
                    })(f);
                    reader.readAsText(f);
                };
                for (var i = 0, f = void 0; f = files[i]; i++) {
                    _loop_3(i, f);
                }
            }, false);
        };
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "grid", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "gridWidth", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "gridHeight", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "gridMaxWidth", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "gridMaxHeight", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "modules", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "currentOptions", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "newModuleType", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "editable", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "configuration", void 0);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], App.prototype, "newModuleTypeWatch", null);
        App = __decorate([
            VueAnnotate_1.VueClass
        ], App);
        return App;
    }(Vue));
    var app = new App('#app');
});
//# sourceMappingURL=editor.js.map