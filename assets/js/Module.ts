
import {Uuid} from "./uuid";
import {Option} from "./Option";

export type ModuleType = 'twitter'|'tradingview'|'iframe';

export abstract class Module{
	type:ModuleType='tradingview';
	uid:string = Uuid.v4();

	width : 1;
	height : 1;

	protected constructor() {
	}

	getLink() : string|null{return null;}

	update(){}

	static getOptions() : Option[]{
		return [];
	}

	setOption(option : Option, refresh:boolean=true){}
	setOptions(options : Array<Option>, refresh:boolean=true){
		for(let option of options)
			this.setOption(option, refresh);
	}
}