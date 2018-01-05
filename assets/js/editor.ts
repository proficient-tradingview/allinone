import {VueClass, VueComputed, VueVar, VueWatched} from "./VueAnnotate";
import {Uuid} from "./uuid";
import {Module, ModuleType} from "./modules/Module";
import {Option} from "./Option";
import {TradingModule} from "./modules/TradingViewModule";
import {TwitterModule} from "./modules/TwitterModule";
import {IframeModule} from "./modules/IframeModule";
import Utils from "./Utils";
import {ModuleFactory} from "./modules/ModuleFactory";
import {Configuration} from "./Configuration";






class Cell{
	used : boolean = false;
	moduleUid:string|null=null;
	full : boolean = false;
	size:{x:number, y:number}={x:1,y:1}
}

@VueClass
class App extends Vue{

	@VueVar()
	grid:Array<Array<Cell> > = [];
	@VueVar()
	gridWidth : number = 2;
	@VueVar()
	gridHeight = 2;

	@VueVar() gridMaxWidth : number = 20;
	@VueVar() gridMaxHeight : number = 20;

	@VueVar()
	modules : Array<Module> = [];

	@VueVar()
	currentOptions : Array<Option> = [];
	@VueVar()
	newModuleType : ModuleType = 'tradingview';

	@VueVar()
	editable : boolean = false;

	@VueVar()
	configuration : Configuration;

	intervalSaveCurrentConfig = 0;

	constructor(containerName : string, vuejsDataConstructor:VueConstructObject|string=''){
		super(vuejsDataConstructor);
		let self = this;
		this.configuration = new Configuration();

		let params = Utils.getSearchParameters();
		console.log(params);
		if(typeof params.chart !== 'undefined'){
			this.buildCompatMultichat(params.chart);
		}else if("data" in params){
			this.buildFromData(atob(params.data));
		}else if("default" in params){
			this.buildDefault(params.default);
		}else {
			this.editable = true;
			this.recalculateGrid();
		}

		this.initDragAndDrop();

		//start auto backup to url : save modules parameters if they change
		this.intervalSaveCurrentConfig = setInterval(function(){
			self.exportToUrl(true);
		}, 2000);
	}

	initDragAndDrop(){
		let counter = 0;

		let appContainer = $('body');
		appContainer.on('dragover', function(e:DragEvent) {
			e.stopPropagation();
			e.preventDefault();
			if(typeof e.dataTransfer !== 'undefined' && "dropEffect" in e.dataTransfer)
				e.dataTransfer.dropEffect = 'copy';

			$('.dropHereToLoad').show();
		});

		let self = this;
		appContainer.on('drop', function(e:any) {
			e.stopPropagation();
			e.preventDefault();
			let dt = e.originalEvent.dataTransfer;
			if (dt.items) {
				for (let i=0; i < dt.items.length; i++) {
					if (dt.items[i].kind == "file") {
						let f = dt.items[i].getAsFile();
						let reader = new FileReader();

						reader.onload = (function(theFile:any) {
							return function(e:any) {
								self.buildFromData(reader.result);
							};
						})(f);
						reader.readAsText(f);
					}
				}
			} else {
				for (let i=0; i < dt.files.length; i++) {
					let reader = new FileReader();

					reader.onload = (function(theFile:any) {
						return function(e:any) {
							self.buildFromData(reader.result);
						};
					})(dt.files[i]);
					reader.readAsText(dt.files[i]);
				}
			}


			$('.dropHereToLoad').hide();
			counter=0;
		});

		appContainer.on('dragenter', function(e:DragEvent) {
			++counter;
		});
		appContainer.on('dragleave', function(e:DragEvent) {
			--counter;
			if(counter==0){
				$('.dropHereToLoad').hide();
			}
		});
	}

	openSidebar(){
		$('#app .ui.labeled.icon.sidebar')
			.sidebar({
				context: '#app'
			})
			.sidebar('toggle')
		;
	}

	toggleEdit(openSidebar : boolean = true){
		this.editable = !this.editable;
		if(openSidebar)
			this.openSidebar();
	}

	cellClick(cell:Cell){
		if(!cell.used) {
			let self  = this;
			$('#newModuleModal')
				.modal({
					onDeny    : function(){
					},
					onApprove : function() {
						let newModule : Module|null=null;
						if(self.newModuleType == 'tradingview')
							newModule = new TradingModule(self.currentOptions);
						if(self.newModuleType == 'twitter')
							newModule = new TwitterModule(self.currentOptions);
						if(self.newModuleType == 'iframe')
							newModule = new IframeModule(self.currentOptions);

						if(newModule !== null) {
							console.log('updated');
							cell.used = true;
							cell.moduleUid = newModule.uid;
							self.modules.push(newModule);
							self.$nextTick(function () {
								if(newModule !== null)
									newModule.update(self.configuration);
								// self.updateAll();
							});
							self.exportToUrl();
						}
					}
				})
				.modal('show')
			;
		}
	}

	updateAll(){
		console.log(this.modules);
		for(let module of this.modules){
			console.log(module);
			module.update(this.configuration);
		}
	}

	showSettings(){
		let self = this;
		let oldGridSize = {
			width:this.gridWidth,
			height:this.gridHeight
		};

		$('#settingsModal')
			.modal({
				onDeny    : function(){
				},
				onApprove : function() {
					if(
						self.gridWidth !== oldGridSize.width ||
						self.gridHeight !== oldGridSize.height
					) {
						self.recalculateGrid(true);
						self.editable = true;
					}
					self.exportToUrl();
				}
			})
			.modal('show')
		;
	}

	showRoadmap(){
		$('#roadmapModal')
			.modal('show')
		;
	}

	destroyAllModules(){
		for(let module of this.modules){
			module.destroy();
		}
		this.modules = [];
	}

	recalculateGrid(clearGrid=false,clearModules=false){
		console.log('---------------------------');
		/*if(clearModules) {
			this.destroyAllModules();
		}
		if(clearGrid) {
			this.grid = [];
		}
		this.$forceUpdate();
		for(let i = 0; i < this.gridHeight; ++i){
			let cells = [];
			for(let j = 0; j < this.gridWidth; ++j){
				cells.push(new Cell());
			}
			this.grid.push(cells);
		}*/

		if(this.gridHeight > this.grid.length){//add rows
			for(let i = this.grid.length; i < this.gridHeight; ++i){
				let cells = [];
				for(let iColumn = 0; iColumn < this.gridWidth; ++iColumn){
					cells.push(new Cell());
				}
				this.grid.push(cells);
			}
		}

		for(let iRow = 0; iRow < this.grid.length; ++iRow){//adding or deleting columns on rows
			console.log('row:',iRow, this.grid[iRow].length,this.gridWidth);
			if(this.grid[iRow].length < this.gridWidth){
				console.log('Adding rows...');
				let start = this.grid[iRow].length;
				for(let iColumn = start; iColumn < this.gridWidth; ++iColumn) {
					this.grid[iRow].push(new Cell());
					console.log('Adding a column on row '+iRow);
				}
			}else if(this.grid[iRow].length > this.gridWidth){
				let end = this.grid[iRow].length;
				let toRemove = this.grid[iRow].length-this.gridWidth;
				console.log('Removing '+toRemove+' on row '+iRow);
				for(let iColumn = this.gridWidth; iColumn < end; ++iColumn){
					if(this.grid[iRow][iColumn].moduleUid !== null) {
						console.log('Deleting module on row '+iRow+' column '+iColumn);
						this.removeModule(this.grid[iRow][iColumn]);
					}
				}
				for(let iColumn = 0; iColumn < this.gridWidth; ++iColumn){
					if(this.grid[iRow][iColumn].moduleUid !== null) {
						if(this.grid[iRow][iColumn].size.x+iColumn >= this.gridWidth){
							this.grid[iRow][iColumn].size.x = this.gridWidth-iColumn;
						}
					}
				}
				this.grid[iRow].splice(this.gridWidth, this.grid[iRow].length-this.gridWidth);
			}
		}

		if(this.gridHeight < this.grid.length) {//removing rows
			let countRowsToRemove = this.grid.length-this.gridHeight;
			console.log('Removing '+countRowsToRemove+' rows');

			for(let iRow = this.gridHeight;iRow < this.grid.length;++iRow){
				for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
					if(this.grid[iRow][iColumn].moduleUid !== null) {
						console.log('Deleting module on row '+iRow+' column '+iColumn);
						this.removeModule(this.grid[iRow][iColumn]);
					}
				}
			}

			for(let iRow = 0;iRow < this.gridHeight;++iRow){
				for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
					if(this.grid[iRow][iColumn].size.y+iRow >= this.gridHeight){
						this.grid[iRow][iColumn].size.y = this.gridHeight-iRow;
					}
				}
			}

			this.grid.splice(this.gridHeight, countRowsToRemove);
		}


	}

	@VueWatched()
	newModuleTypeWatch(){
		let self = this;
		console.log('change options');
		if(this.newModuleType == 'tradingview')
			this.currentOptions = TradingModule.getOptions();
		if(this.newModuleType == 'twitter')
			this.currentOptions = TwitterModule.getOptions();
		if(this.newModuleType == 'iframe')
			this.currentOptions = IframeModule.getOptions();

		this.currentOptions = ModuleFactory.optionsFromType(this.newModuleType);

		this.$nextTick(function () {
			$('#app .ui.checkbox').checkbox();
		});
	}

	buildCompatMultichat(charts : string[]){
		let self = this;
		let perLine = 2;
		console.log('----------multicoincharts compat---------');
		if(charts.length > 4) perLine = 3;
		if(charts.length > 8) perLine = 4;
		if(charts.length > 16) perLine = 5;
		console.log('Charts per line'+perLine);

		this.gridHeight = Math.ceil(charts.length/perLine);
		this.gridWidth = perLine;


		console.log('grid height:'+this.gridHeight);

		this.recalculateGrid();

		let xCell = 0;
		let yCell = 0;
		for(let chart of charts){
			let module = new TradingModule();
			module.symbol = chart;
			this.modules.push(module);

			this.grid[yCell][xCell].used = true;
			this.grid[yCell][xCell].moduleUid = module.uid;

			console.log(chart+'->'+module.uid);

			++xCell;
			if(xCell === perLine){
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
	}

	buildFromData(data : any){
		data = JSON.parse(data);
		console.log('Build from data (v:'+data.version+')');
		if(data.version == 1 || typeof data.version === 'undefined')
			this.buildFromDataV1(data);
	}

	buildFromDataV1(data : any){
		let self = this;

		console.log(data);

		this.grid = [];
		this.destroyAllModules();
		this.gridHeight = data.grid.length;
		this.gridWidth = data.grid.length > 0 ? data.grid[0].length : 2;

		for(let row of data.grid){
			let cells = [];
			for(let cellContent of row){
				let cell = new Cell();
				cell.moduleUid = cellContent.moduleUid;
				cell.used = cellContent.used;
				if(typeof cellContent.full !== 'undefined') cell.full = cellContent.full;
				if(typeof cellContent.size !== 'undefined') cell.size = cellContent.size;
				cells.push(cell);
			}
			this.grid.push(cells);
		}

		for(let moduleContent of data.modules){
			let module : Module = ModuleFactory.newModuleFromType(moduleContent.type);

			if(module !== null) {
				for (let i in moduleContent) {
					(<any>module)[i] = moduleContent[i];
				}
				this.modules.push(module);
			}
		}

		if("configuration" in data){
			for(let i in data.configuration){
				(<any>this.configuration)[i] = data.configuration[i];
			}
		}

		this.$nextTick(function () {
			console.log('update all');
			self.updateAll();
		});

		this.exportToUrl();
	}

	buildDefault(type = '$'){
		console.log('build from default');
		if(type != '$' && type != '€')type = '$';
		let self = this;

		this.grid = [];
		this.destroyAllModules();

		this.gridWidth = 2;
		this.gridHeight = 2;
		this.recalculateGrid(true, true);

		if(type == '$') {
			let btcUsdt = new TradingModule();			btcUsdt.symbol = 'BINANCE:BTCUSDT';			this.grid[0][0].moduleUid = btcUsdt.uid; 		this.modules.push(btcUsdt);
			let ltcUsdt = new TradingModule();			ltcUsdt.symbol = 'BINANCE:LTCUSDT';			this.grid[0][1].moduleUid = ltcUsdt.uid;		this.modules.push(ltcUsdt);
			let ethUsdt = new TradingModule();			ethUsdt.symbol = 'BINANCE:ETHUSDT';			this.grid[1][0].moduleUid = ethUsdt.uid;		this.modules.push(ethUsdt);
		}else if(type == '$') {
			let btcUsdt = new TradingModule();			btcUsdt.symbol = 'BITSTAMP:BTCEUR';			this.grid[0][0].moduleUid = btcUsdt.uid;		this.modules.push(btcUsdt);
			let ltcUsdt = new TradingModule();			ltcUsdt.symbol = 'BITSTAMP:LTCEUR';			this.grid[0][1].moduleUid = ltcUsdt.uid;		this.modules.push(ltcUsdt);
			let ethUsdt = new TradingModule();			ethUsdt.symbol = 'BITSTAMP:ETHEUR';			this.grid[1][0].moduleUid = ethUsdt.uid;		this.modules.push(ethUsdt);
		}

		this.$nextTick(function () {
			console.log('update all');
			self.updateAll();
		});
		this.exportToUrl();
	}

	expandCell(cell : Cell){
		cell.full=true;
		this.exportToUrl();
	}

	shortCell(cell : Cell){
		cell.full=false;
		this.exportToUrl();
	}

	removeModule(cell : Cell){
		for(let iRow = 0; iRow < this.grid.length;++iRow){
			for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
				let searchCell = this.grid[iRow][iColumn];
				if(searchCell === cell){
					for(let x = 0; x < cell.size.x; ++x){
						for(let y = 0; y < cell.size.y; ++y) {
							this.grid[iRow+y][iColumn+x].used = false;
						}
					}
				}
			}
		}

		for(let iModule = 0; iModule < this.modules.length; ++iModule){
			if(this.modules[iModule].uid == cell.moduleUid){
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
	}

	openExternal(cell : Cell){
		for(let module of this.modules){
			if(module.uid === cell.moduleUid){
				let link = module.getLink();
				if(link !== null){
					window.open(link, '_blank');
				}
				break;
			}
		}
	}

	changeCellSize(cell : Cell, direction : 'down'|'up'|'left'|'right'){
		let collide = false;


		for(let iRow = 0; iRow < this.grid.length;++iRow){
			for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
				let searchCell = this.grid[iRow][iColumn];
				if(searchCell === cell){
					if(direction == 'down') {
						if(iRow+cell.size.y < this.grid.length){
							for (let x = 0; x < cell.size.x; ++x) {
								if(this.grid[iRow+1][iColumn + x].used){
									collide = true;
								}
							}
						}else
							collide = true;
					}else if(direction == 'right') {
						if(iColumn+cell.size.x < this.grid[iRow].length){
							for (let y = 0; y < cell.size.x; ++y) {
								if(this.grid[iRow+y][iColumn+1].used){
									collide = true;
								}
							}
						}else
							collide = true;
					}

					if(!collide)
						for(let x = 0; x < cell.size.x; ++x){//clear used cells
							for(let y = 0; y < cell.size.y; ++y) {
								this.grid[iRow+y][iColumn+x].used = false;
							}
						}
				}
			}
		}

		if(collide)
			return;

		if(direction == 'up'){
			if(cell.size.y > 1)
				cell.size.y -= 1;
		}
		if(direction == 'left'){
			if(cell.size.x > 1)
				cell.size.x -= 1;
		}
		if(direction === 'down') {
			for(let iRow = 0; iRow < this.grid.length;++iRow){
				for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
					let searchCell = this.grid[iRow][iColumn];
					if(searchCell === cell){//collision already done
						cell.size.y += 1;
					}
				}
			}
		}
		if(direction === 'right') {
			for(let iRow = 0; iRow < this.grid.length;++iRow){
				for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
					let searchCell = this.grid[iRow][iColumn];
					if(searchCell === cell){//collision already done
						cell.size.x += 1;
					}
				}
			}
		}

		//set cells as used
		for(let iRow = 0; iRow < this.grid.length;++iRow){
			for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
				let searchCell = this.grid[iRow][iColumn];
				if(searchCell === cell){
					for(let x = 0; x < cell.size.x; ++x){
						for(let y = 0; y < cell.size.y; ++y) {
							this.grid[iRow+y][iColumn+x].used = true;
						}
					}
				}
			}
		}

		this.exportToUrl();
	}



	canGrowCell(cell : Cell, direction : 'down'|'right'){
		if(direction == 'down'){
			for(let iRow = 0; iRow < this.grid.length;++iRow){
				for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
					let searchCell = this.grid[iRow][iColumn];
					if(searchCell === cell){
						if(iRow+cell.size.y < this.grid.length){
							for (let x = 0; x < cell.size.x; ++x) {
								if(this.grid[iRow+1][iColumn + x].used){
									return false;
								}
							}

							return true;
						}
					}
				}
			}
		}
		if(direction === 'right') {
			for(let iRow = 0; iRow < this.grid.length;++iRow){
				for(let iColumn = 0; iColumn < this.grid[iRow].length; ++iColumn){
					let searchCell = this.grid[iRow][iColumn];
					if(searchCell === cell){
						if(iColumn+cell.size.x < this.grid[iRow].length){
							for (let y = 0; y < cell.size.x; ++y) {
								if(this.grid[iRow+y][iColumn+1].used){
									return false;
								}
							}
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	addToBookmark(){
		let bookmarkURL = window.location.href;
		let bookmarkTitle = document.title;

		if ('addToHomescreen' in window && (<any>window).addToHomescreen.isCompatible) {
			// Mobile browsers
			(<any>window).addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
		} else if ((<any>window).sidebar && (<any>window).sidebar.addPanel) {
			// Firefox version < 23
			(<any>window).sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
		} else if (window.external && ('AddFavorite' in window.external)) {
			// IE Favorite
			(<any>window).external.AddFavorite(bookmarkURL, bookmarkTitle);
		} else {
			// Other browsers (mainly WebKit - Chrome/Safari)
			alert('Please press ' + (/Mac/i.test(navigator.userAgent) ? 'Strg' : 'CMD') + ' + D to add this page to your favorites.');
		}
	}

	export(){
		let modules : Array<any >= [];
		for(let module of this.modules){
			modules.push(module.exportToJson())
		}

		let ojson = {
			version:1,
			grid:this.grid,
			modules:modules,
			configuration:this.configuration
		};

		let json = JSON.stringify(ojson);
		return json;
	}

	exportToUrl(replace=false){
		let json = this.export();
		if(replace)
			window.history.replaceState(null,'','?data='+btoa(json));
		else
			window.history.pushState(null,'','?data='+btoa(json));
	}

	saveConfig(){
		let blob = new Blob([this.export()], {type: "application/json;charset=utf-8"});
		let now = new Date();
		let nowFormatted = now.getFullYear()+'-';

		if(now.getMonth()+1 < 10)nowFormatted += '0';
		nowFormatted+=(now.getMonth()+1)+'-';

		if(now.getDate() < 10)nowFormatted += '0';
		nowFormatted+=now.getDate()+' ';

		if(now.getHours() < 10)nowFormatted += '0';
		nowFormatted+=now.getHours()+':';

		if(now.getMinutes() < 10)nowFormatted += '0';
		nowFormatted+=now.getMinutes();

		saveAs(blob, 'allinone-'+nowFormatted+'.json');
	}
	loadConfig(){
		let self = this;
		let inputs = $('<input type="file" />');
		inputs.click();

		let input = <HTMLInputElement>inputs[0];
		input.addEventListener('change', function(event : Event){
			let files = input.files; // FileList object
			if(files === null)return;
			console.log(files);

			for (let i = 0, f; f = files[i]; i++) {
				let reader = new FileReader();

				reader.onload = (function(theFile) {
					return function() {
						self.buildFromData(reader.result);
					};
				})(f);
				reader.readAsText(f);
			}
		}, false);

	}

}

let app = new App('#app');