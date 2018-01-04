import {Module, ModuleType} from "./Module";
import {TradingModule} from "./TradingViewModule";
import {IframeModule} from "./IframeModule";
import {TwitterModule} from "./TwitterModule";
import {Option} from "../Option";

export class ModuleFactory{
	
	static newModuleFromType(type : ModuleType) : Module{
		if(type === 'tradingview'){
			return new TradingModule();
		}else if(type === 'iframe'){
			return new IframeModule();
		}else if(type === 'twitter'){
			return new TwitterModule();
		}else
			return new IframeModule();
	}	
	
	static optionsFromType(type : ModuleType) : Array<Option>{
		if(type == 'tradingview')
			return TradingModule.getOptions();
		if(type == 'twitter')
			return TwitterModule.getOptions();
		if(type == 'iframe')
			return IframeModule.getOptions();
		return [];
	}
	
}