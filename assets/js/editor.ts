import {VueClass, VueComputed, VueVar, VueWatched} from "./VueAnnotate";
import {Uuid} from "./uuid";
import {Module, ModuleType} from "./Module";
import {Option} from "./Option";
import {TradingModule} from "../TradingViewModule";
import {TwitterModule} from "../TwitterModule";
import {IframeModule} from "../IframeModule";
import Utils from "./Utils";
import {ModuleFactory} from "./ModuleFactory";






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

	@VueVar() gridMaxWidth : number = 10;
	@VueVar() gridMaxHeight : number = 10;

	@VueVar()
	modules : Array<Module> = [];

	@VueVar()
	currentOptions : Array<Option> = [];
	@VueVar()
	newModuleType : ModuleType = 'tradingview';

	@VueVar()
	editable : boolean = false;

	constructor(containerName : string, vuejsDataConstructor:VueConstructObject|string=''){
		super(vuejsDataConstructor);

		let params = Utils.getSearchParameters();
		if(typeof params.chart !== 'undefined'){
			this.buildCompatMultichat(params.chart);
		}else if(typeof params.data !== 'undefined'){
			this.buildFromData(atob(params.data));
		}else {
			this.editable = true;
			this.recalculateGrid();
		}

		/*$.ajax({
			url:'https://alerts.tradingview.com/alerts/',
			method:'POST',
			// data:'{"m":"list_alerts","p":{"limit":30,"inc_cross_int":true}}',
			data:'{"m":"list_events","p":{"limit":50,"inc_del":true,"inc_cross_int":true}}',
			xhrFields: {
				withCredentials: true
			}
		}).done(function(data : any){
			console.log(data);
		});*/
	}

	openSidebar(){
		$('#app .ui.labeled.icon.sidebar')
			.sidebar({
				context: '#app'
			})
			.sidebar('toggle')
		;
	}

	toggleEdit(){
		this.editable = !this.editable;
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
									newModule.update();
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
			module.update();
		}
	}

	showSettings(){
		let self = this;
		$('#settingsModal')
			.modal({
				onDeny    : function(){
				},
				onApprove : function() {
					self.recalculateGrid(true);
				}
			})
			.modal('show')
		;
	}

	recalculateGrid(clearGrid=false,clearModules=false){
		if(clearModules) {
			this.modules = [];
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
		this.modules = [];

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

		this.$nextTick(function () {
			console.log('update all');
			self.updateAll();
		});
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
					if(searchCell === cell){
						if(iRow+cell.size.y < this.grid.length){
							cell.size.y += 1;
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
							cell.size.x += 1;
						}
					}
				}
			}
		}

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

	addToBookmark(){
		var bookmarkURL = window.location.href;
		var bookmarkTitle = document.title;

		if ('addToHomescreen' in window && window.addToHomescreen.isCompatible) {
			// Mobile browsers
			window.addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
		} else if (window.sidebar && window.sidebar.addPanel) {
			// Firefox version < 23
			window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
		} else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
			// Firefox version >= 23 and Opera Hotlist
			$(this).attr({
				href: bookmarkURL,
				title: bookmarkTitle,
				rel: 'sidebar'
			}).off(e);
			return true;
		} else if (window.external && ('AddFavorite' in window.external)) {
			// IE Favorite
			window.external.AddFavorite(bookmarkURL, bookmarkTitle);
		} else {
			// Other browsers (mainly WebKit - Chrome/Safari)
			alert('Please press ' + (/Mac/i.test(navigator.userAgent) ? 'CMD' : 'Strg') + ' + D to add this page to your favorites.');
		}
	}

	export(){
		let ojson = {
			version:1,
			grid:this.grid,
			modules:this.modules
		};

		let json = JSON.stringify(ojson);
		console.log(json);
		return json;
	}

	exportToUrl(){
		let json = this.export();
		window.history.pushState(null,'','?data='+btoa(json));
	}

}

let app = new App('#app');