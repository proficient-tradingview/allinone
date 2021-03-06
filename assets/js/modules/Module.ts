
import {Uuid} from "../uuid";
import {Option} from "../Option";
import {Configuration} from "../Configuration";

export type ModuleType = 'twitter'|'tradingview'|'iframe';

export abstract class Module{
	type:ModuleType='tradingview';
	uid:string = Uuid.v4();

	protected constructor() {
	}

	abstract exportToJson() : any;

	destroy(){}

	getLink() : string|null{return null;}

	update(config : Configuration){}

	static getOptions() : Option[]{
		return [];
	}

	setOption(option : Option){}
	setOptions(options : Array<Option>, refresh:boolean=true){
		for(let option of options)
			this.setOption(option);
	}
}