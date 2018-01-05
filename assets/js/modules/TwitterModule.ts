import {Module} from "./Module";
import {Option, OptionValueLabel} from "../Option";
import {Configuration} from "../Configuration";

export class TwitterModule extends Module{

	ref : string;
	theme : string;

	constructor(options:Array<Option>=[]){
		super();
		this.type = 'twitter';
		this.setOptions(options,false);
	}

	exportToJson(): any {
		return {
			type:this.type,
			uid:this.uid,
			ref:this.ref,
			theme:this.theme,
		};
	}

	static getOptions(): Option[] {
		return [
			new Option('ref', 'text', 'Symbol', 'https://twitter.com/Capetlevrai'),
			new Option('theme', 'select', 'Theme', 'Dark', [new OptionValueLabel('Dark', 'Dark'), new OptionValueLabel('Light', 'Light')])
		]
	}

	setOption(option: Option) {
		if(option.id == 'ref')	this.ref = option.value;
		if(option.id == 'theme')	this.theme = option.value;
	}

	update(config : Configuration){
		let options = '';
		if(this.theme == 'Dark') options += ' data-theme="dark"';

		$('#'+this.uid+'-content').html('<a class="twitter-timeline" href="'+this.ref+'" '+options+'>Tweets</a>');
		twttr.widgets.load(
			document.getElementById(this.uid+'-content')
		);
	}
}