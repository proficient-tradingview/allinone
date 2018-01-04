export function VueClass(target: any) {
	const original = target;
	const newConstructor: any = function (this : any, ...args: any[]) {
		let initParams : VueConstructObject = {el:'', data:{}};
		if(args.length == 1 && typeof args[0] == 'string'){
			initParams = {
				el:args[0],
				data:{},
				watch:{},
				computed:{},
				updated:undefined
			};

			if(typeof this['metadata'] !== 'undefined'){
				for(let varName in this['metadata'].vars){
					initParams.data[varName] = this[varName];
				}
				for(let varName in this['metadata'].watch){
					let descriptor : {funcName:string, deep:boolean} = this['metadata'].watch[varName];
					if(descriptor.deep)
						initParams.watch[varName] = {
							handler:this[descriptor.funcName],
							deep:true
						};
					else
						initParams.watch[varName] = this[descriptor.funcName];
				}
				for(let index in this['metadata'].computed){
					let descriptor : {bindOn:string, action:string,name:string} = this['metadata'].computed[index];
					if(typeof initParams.computed[descriptor.bindOn] === 'undefined')
						initParams.computed[descriptor.bindOn] = {};
					initParams.computed[descriptor.bindOn][descriptor.action] = this[descriptor.name];
				}
				if(this['metadata'].updated !== null){
					initParams.updated = this[this['metadata'].updated];
				}
			}


		}else if(args.length == 1){
			initParams = args[0];
		}

		// console.log(initParams);

		const c: any = function (this : any) {
			args.push(initParams);
			return original.apply(this, args);
		};
		c.prototype = original.prototype;
		return new c();
	};

	newConstructor.prototype = original.prototype;

	return newConstructor;
}

export function VueWatched(listenedPropertyOrDeep:string|null|boolean='', deep:boolean=false) {
	return function (target : any, propertyKey: string, descriptor: PropertyDescriptor) {
		if(typeof target['metadata'] === 'undefined')target['metadata'] = {watch:{}, vars:{}, computed:[], updated:null};
		let listenedProperty : string = '';
		if(listenedPropertyOrDeep === true){
			deep = true;
			listenedPropertyOrDeep = null;
		}else if(listenedPropertyOrDeep === false){
			deep = false;
			listenedPropertyOrDeep = null;
		}else if(listenedPropertyOrDeep === null){
			listenedPropertyOrDeep = '';
		}else{
			listenedProperty = listenedPropertyOrDeep;
		}

		if(listenedProperty === ''){
			let wordsResearch = ['Watch'];
			for(let wordResearch of wordsResearch) {
				if (propertyKey.indexOf(wordResearch) === propertyKey.length - wordResearch.length) {
					listenedProperty = propertyKey.substr(0, propertyKey.length - wordResearch.length);
					break;
				}
			}
		}
		console.log(listenedProperty);
		target['metadata'].watch[listenedProperty] = {funcName:propertyKey, deep:deep};
	}
}

export function VueVar() {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		if(typeof target['metadata'] === 'undefined')target['metadata'] = {watch:{}, vars:{}, computed:[], updated:null};
		target['metadata'].vars[propertyKey] = true;
	}
}

export function VueUpdated() {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		if(typeof target['metadata'] === 'undefined')target['metadata'] = {watch:{}, vars:{}, computed:[], updated:null};
		target['metadata'].updated = propertyKey;
	}
}

export function VueComputed(varName:string='', action:'get'|'set'|''='') {
	return function PropertyDecorator(target: Object|any,propertyKey: string) {
		if(typeof target['metadata'] === 'undefined')target['metadata'] = {watch:{}, vars:{}, computed:[], updated:null};

		if(varName == '' && action == ''){
			if(propertyKey.indexOf('get') == 0){
				action = 'get';
				varName = propertyKey.charAt(3).toLowerCase()+propertyKey.substr(4);
			}else if(propertyKey.indexOf('set') == 0){
				action = 'set';
				varName = propertyKey.charAt(3).toLowerCase()+propertyKey.substr(4);
			}
		}else if(action == ''){
			action = 'get';
		}

		if(varName == ''){
			varName = propertyKey;
		}

		target['metadata'].computed.push({bindOn:varName,name:propertyKey, action:action});
	}
}


// class Test extends VueCompat{
// 	@VueVar('fdsfds')
// 	test : string = '';
//
// 	testNotWatched : string = 'grrrr';
//
// 	@VueWatched()
// 	testWatch(){
// 		console.log('MODIFIER');
// 	}
//
// 	@VueComputed()
// 	getTest2(){
// 		return this.test;
// 	}
//
// 	@VueComputed()
// 	setTest2(value : string){
// 		this.test = value;
// 	}
//
// 	constructor(container : string){
// 		super(container);
// 		console.log('INITIALIZED');
// 		this.test = 'HELLO';
// 	}
// }
//
// let test = new Test('#container');