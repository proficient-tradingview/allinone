import {Module} from "./Module";
import {Option, OptionValueLabel} from "../Option";

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

	setOption(option: Option, refresh=true) {
		if(option.id == 'href')	this.href = option.value;
		if(refresh)this.update();
	}

	update(){
		let options = 'options';
		$('#'+this.uid+'-content').html('<iframe src="'+this.href+'" '+options+' style="width:100%;height:100%">Tweets</iframe>');
	}
}