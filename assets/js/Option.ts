export type OptionType = 'text'|'select'|'check';

export class OptionValueLabel{
	value : string = '';
	label : string = '';

	constructor(value: string, label: string) {
		this.value = value;
		this.label = label;
	}
}

export class Option{
	id:string='';
	type:OptionType='text';
	value:any;
	label:string;
	values:any;

	constructor(id: string, type:OptionType='text', label:string|null=null, value:any, values:any=null) {
		this.id = id;
		this.type = type;
		this.value = value;
		this.values = values;
		if(label==null){
			this.label = id;
		}else
			this.label = label;
	}
}