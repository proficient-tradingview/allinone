import {Module} from "./Module";
import {Option, OptionValueLabel} from "../Option";
import {Configuration} from "../Configuration";

export class IframeModule extends Module{

	href : string;

	constructor(options:Array<Option>=[]){
		super();
		this.type = 'iframe';
		this.setOptions(options,false);
	}


	static getOptions(): Option[] {
		return [
			new Option('href', 'text', 'URL', 'https://quickfingerstraders.slack.com'),
		]
	}

	setOption(option: Option) {
		if(option.id == 'href')	this.href = option.value;
	}

	update(config : Configuration){
		let options = 'options';
		$('#'+this.uid+'-content').html('<iframe src="'+this.href+'" '+options+' style="width:100%;height:100%">Tweets</iframe>');
	}
}