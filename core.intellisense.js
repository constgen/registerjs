//http://msdn.microsoft.com/en-us/library/hh874692.aspx
//http://msdn.microsoft.com/en-us/library/hh524453.aspx
//http://msdn.microsoft.com/en-us/library/microsoft.visualstudio.language.intellisense.standardglyphgroup.aspx?cs-save-lang=1&cs-lang=jscript#code-snippet-1



(function() {
	var undefined;
	//Mysterious `_$createEventManager` function, that was found in VS Reference sources. It does magic for function parameters reference.
	var _eventManager = _$createEventManager(function () {
		return {}
	})



							/*Reference START*/

	

	var Promise = function(initFunc, cancelFunc) {
		/// <signature>
		/// <summary>Polymorphic Promise constructor. If not used with `new` operator, returns instantly resolved promise object.</summary>
		/// <param name="initFunc" type="Function" optional="true">Initialization function.</param>
		/// <param name="cancelFunc" type="Function" optional="true">Cancellation function.</param>
		/// <returns type="Promise">Promise object.</returns>
		/// </signature>
		if (this === window || this === undefined || (this && this.Promise)) {
			return new Promise(initFunc, cancelFunc)
		}
		return this;
	}
	Promise.prototype.then = function(successCallback, errorCallbacke, progressCallback) {
		/// <signature>
		/// <summary>Attaches callbacks.</summary>
		/// <param name="successCallback" type="Function" optional="true">Will be called in case of successful fulfillment.</param>
		/// <param name="errorCallback" type="Function" optional="true">Will be called in case of any error.</param>
		/// <param name="progressCallback" type="Function" optional="true">Will be called on every step, wile Promise is not fulfilled.</param>
		/// <returns type="Promise">A new Promise object.</returns>
		/// </signature>
		return new Promise;
	}
	Promise.prototype.catch = function(errorCallback) {
		/// <signature>
		/// <summary>Attaches error callback.</summary>
		/// <param name="errorCallback" type="Function" optional="true">Will be called in case of any error.</param>
		/// <returns type="Promise">A new Promise object.</returns>
		/// </signature>
		return new Promise;
	}
	Promise.prototype.cancel = function () {
		/// <summary>Rejects Promise, if have not fulfilled yet.</summary>
		/// <returns type="Promise">The same Promise object.</returns>
		return this;
	}
	Promise.prototype.wait = function(ms) {
		/// <signature>
		/// <summary>Wait before resolve the promise.</summary>
		/// <param name="ms" type="Number" optional="true" integer="true">Delay.</param>
		/// <returns type="Promise">The same Promise object.</returns>
		/// </signature>
		return this;
	}
	Promise.prototype.timeout = function(ms) {
		/// <signature>
		/// <summary>Wait before reject and cancel promise.</summary>
		/// <param name="ms" type="Number" optional="true" integer="true">Delay.</param>
		/// <returns type="Promise">The same Promise object.</returns>
		/// </signature>
		return this;
	}
	Promise.prototype.interval = function(ms) {
		/// <signature>
		/// <summary>Call progress with interval before promise is resolved or rejected.</summary>
		/// <param name="ms" type="Number" optional="true" integer="true">Interval.</param>
		/// <returns type="Promise">The same Promise object.</returns>
		/// </signature>
		return this;
	}
	Promise.prototype.delay = function(ms) {
		/// <signature>
		/// <summary>Create delay between callbacks and errorbacks, has no effect to progressback.</summary>
		/// <param name="ms" type="Number" optional="true" integer="true">Delay.</param>
		/// <returns type="Promise">A new Promise object.</returns>
		/// </signature>
		return new Promise;
	}
	Promise.prototype.and = function(p) {
		/// <signature>
		/// <summary>Current promise can't be resolved until passed promise will resolve. If passed promise will fail, current promise also will fail with that error.</summary>
		/// <param name="promise" type="Promise">Another Promise object.</param>
		/// <returns type="Promise">A new Promise object.</returns>
		/// </signature>
		return new Promise;
	}

	Promise.all =
	Promise.every = function(/*args*/) {
		/// <signature>
		/// <summary>Gathers many promises and becomes resolved, when they all resolved.</summary>
		/// <param parameterArray="true" name="Promises" type="Array">Array of any values or Promises.</param>
		/// <returns type="Promise">Promise object.</returns>
		/// </signature>
	}
	Promise.any = function(/*args*/) {
		/// <signature>
		/// <summary>Gathers many promises and becomes resolved, when they all fulfilled with any results.</summary>
		/// <param parameterArray="true" name="Promises" type="Array">Array of any values or Promises.</param>
		/// <returns type="Promise">Promise object.</returns>
		/// </signature>
	}
	Promise.some = function(/*args*/) {
		/// <signature>
		/// <summary>Gathers many promises and becomes resolved, when they all fulfilled with any results. But if all promises are rejected, also becomes rejected.</summary>
		/// <param parameterArray="true" name="Promises" type="Array">Array of any values or Promises.</param>
		/// <returns type="Promise">Promise object.</returns>
		/// </signature>
	}
	Promise.isPromise = function(value) {
		/// <summary>Determines if `value` is a Promise-like object.</summary>
		/// <param name="value">Any value.</param>
		/// <returns type="Boolean">true or false.</returns>
	}
	
	var LoadPromise = function(initFunc, cancelFunc) {
		if (this instanceof Promise) { //with `new` operator
			Promise.call(this, initFunc, cancelFunc)
		}
		else { //as a function
			return new LoadPromise(function(resolve) {
				resolve(initFunc)
			})
		}
	}
	LoadPromise.prototype = Object.create(Promise.prototype)
	LoadPromise.prototype.constructor = LoadPromise
	LoadPromise.prototype.then = function(successCallback, errorCallbacke, progressCallback) {
		/// <signature>
		/// <summary>Attaches callbacks.</summary>
		/// <param name="successCallback" type="Function" optional="true">Will be called in case of successful fulfillment.</param>
		/// <param name="errorCallback" type="Function" optional="true">Will be called in case of any error.</param>
		/// <param name="progressCallback" type="Function" optional="true">Will be called on every step, wile Promise is not fulfilled.</param>
		/// <returns type="LoadPromise">A new Promise object.</returns>
		/// </signature>
		return new LoadPromise(
			Promise.prototype.then.call(this, successCallback, errorCallbacke, progressCallback)
		)
	}
	LoadPromise.prototype.load = function(src, options) {
		return this.then(function() {
			return CorePrivate.load(src, options)
		})
	}

	var Templater = function(sandbox) {
		return function(string) {
			/// <summary>Processes {*}-like expressions in the string and replace them with data according to preset rules. If expression has no replacement rule, it stays as it is.</summary>
			/// <param name="string" type="String">String to be parsed.</param>
			/// <returns type="String">New string with processed variables.</returns>
		}
	}

	var SandboxConstructor = function(moduleName) {
		/// <summary>Creates new sandbox instance, that may serve some module.</summary>
		/// <param name="moduleName" type="String" optional="true">Context module name.</param>
		/// <returns type="Object">Sandbox instance.</returns>
		/// <field name='moduleName' type='String'>Sandbox context module name.</field>
		/// <field name='moduleUrl' type='String'>Sandbox context module URL.</field>
		/// <field name='Promise' static='true' type='Function'>Alias to `Core.Promise`.</field>
		/// <field name='template' type='Function'>String variables processing in context of sandbox.</field>
		this.template = Templater(this)
	}
	SandboxConstructor.prototype.hasFeature = function(featureName) {
		/// <summary>Checks if feature is supported by environment.</summary>
		/// <param name="featureName" type="String">Feature property name.</param>
		/// <returns type="Boolean">true or false.</returns>
	}
	SandboxConstructor.prototype.load = function(url) {
		/// <summary>Alias to `Core.load(url, options)`, but with additional context templating rules for URLs.</summary>
		/// <returns type="LoadPromise">Result of resource load.</returns>
		return Core.load(url);
	}
	SandboxConstructor.prototype.Promise = Promise
	SandboxConstructor.prototype.listen = function(eventType, handler) {
		/// <summary>Attaches Core event listeners in runtime. This is an alternative way to add listener of Core events. These events are removed, when module will be destroyed, so they may be used in `init()`.</summary>
		/// <param name="eventType" type="String">Event type.</param>
		/// <param name="handler" type="Function">Callback handler.</param>
		/// <returns type="Object">Sandbox instance.</returns>
	}
	SandboxConstructor.prototype.action = function(actionType, detail) {
		/// <summary>Generates action in Core with attached details.</summary>
		/// <param name="actionType" type="String">Action type.</param>
		/// <param name="detail" type="Object" optional="true">Details.</param>
		/// <returns type="Object">Sandbox instance.</returns>
	}

	SandboxConstructor.addTemplateRule = function(regexp, result) {
		///	<signature>
		/// <summary>Ads new templating rule for sandbox.template() call.</summary>
		/// <param name="regexp" type="RegExp">Regular expression</param>
		/// <param name="result" type="Function" value="function(context){return ''})">Function that returns string for replacement.</param>
		/// </signature>
		///	<signature>
		/// <summary>Ads new templating rule for sandbox.template() call.</summary>
		/// <param name="regexp" type="RegExp">Regular expression.</param>
		/// <param name="result" type="String">String for replacement.</param>
		/// </signature>
	}


	var CorePrivate = {
		template: Templater(),
		addTemplateRule: function(regexp, result) {
			///	<signature>
			/// <summary>Ads new templating rule for Core.template() call.</summary>
			/// <param name="regexp" type="RegExp">Regular expression.</param>
			/// <param name="result" type="Function" value="function(context){return ''})">Function that returns string for replacement.</param>
			/// </signature>
			///	<signature>
			/// <summary>Ads new templating rule for Core.template() call.</summary>
			/// <param name="regexp" type="RegExp">Regular expression.</param>
			/// <param name="result" type="String">String for replacement.</param>
			/// </signature>
		},
		Promise: Promise,
		load: function(src, options) {
			/// <signature>
			/// <summary>1. Loads any resource that you can imagine by URL.</summary>
			/// <param name="src" type="String">Path to resource to be loaded.</param>
			/// <param name="options" type="Object" optional="true" value="{defer: false, async: false, reload: false, cache: undefined}">Options.</param>
			/// <returns type="LoadPromise">Result of resource load.</returns>
			/// </signature>
			/// <signature>
			/// <summary>2. Loads any resources that you can imagine by URLs.</summary>
			/// <param name="Srcs" type="Array" elementType="String">Array of paths to resources to be loaded.</param>
			/// <param name="options" type="Object" optional="true" value="{defer: false, async: false, reload: false, cache: undefined}">Options.</param>
			/// <returns type="LoadPromise">Result of all resources load.</returns>
			/// </signature>
			/// <signature>
			/// <summary>3. Ensures that DOM element is loaded</summary>
			/// <param name="element" type="HTMLElement" elementMayBeNull="true">HTML element with `src` or `href` property</param>
			/// <param name=''/>
			/// <returns type="LoadPromise">Result of resource load.</returns>
			/// </signature>
			return new LoadPromise();
		},
		/// <field type='Promise'>Promise of document 'DOMContentLoaded'.</field>
		DOMReady: new Promise,
		/// <field type='Promise'>Promise of window 'load'.</field>
		DOMLoaded: new Promise,
		/// <field type='Promise'>Promise of included and loaded UI modules.</field>
		UIReady: new Promise,
		/// <field type='Object'>Utilitiy functions.</field>
		Util: {
			limited: function(func, ms) {
				/// <summary>Limited frequency of function execution.</summary>
				/// <param name="func" type="Function">Original function.</param>
				/// <param name="ms" type="Number" optional="true">Interval in milliseconds.</param>
				/// <returns type="Function">New function, that can't execute frequently.</returns>
			},
			deferred: function(func, ms) {
				/// <summary>Delay function execution until frequent calling will end/stop.</summary>
				/// <param name="func" type="Function">Original function.</param>
				/// <param name="ms" type="Number" optional="true">Delay in milliseconds.</param>
				/// <returns type="Function">New function, that is executed only once after all frequent calls stop.</returns>
			},
			XHR: function() {
				/// <summary>Cross browser XmlHttpRequest constructor for AJAX requests.</summary>
				/// <returns type="Object">XmlHttpRequest object.</returns>
			},
			_requestTextContent: function(url, isAsync) {
				/// <summary>Request for text content of any file. Used for internal tasks.</summary>
				/// <param name="url" type="String">Path to file.</param>
				/// <param name="isAsync" type="Boolean" optional="true">Async or not.</param>
				/// <returns type="Promise">Result of request.</returns>
			},
			request: function (url, error) {
				/// <summary>Synchronous request for text content of any file.</summary>
				/// <param name="url" type="String">Path to file.</param>
				/// <param name="error" type="Function" optional="true">Error handler.</param>
				/// <returns type="String">Result of request.</returns>
			},
			requestSync: function (url) {
				/// <summary>Synchronous request for text content of any file. Same as `Core.request()` but with the Promise interface.</summary>
				/// <param name="url" type="String">Path to a file.</param>
				/// <returns type="Promise">Result of request.</returns>
			},
			requestAsync: function (url) {
				/// <summary>Asynchronous request for text content of any file.</summary>
				/// <param name="url" type="String">Path to file.</param>
				/// <returns type="Promise">Result of request.</returns>
			},
			execute: function(expression) {
				/// <summary>Evaluates JavaScript expression in closed function scope. `var` and `return` statements are not allowed.</summary>
				/// <param name="expression" type="String">JavaScript expression in string.</param>
				/// <returns type="">Result of evaluation.</returns>
			},
			asyncCall: function(isAsync, func) {
				/// <signature>
				/// <summary>Call function asynchronously or not.</summary>
				/// <param name="isAsync" type="Boolean">Async or not.</param>
				/// <param name="func" type="Function">Function to be called.</param>
				/// <returns type="Number">Timeout ID, if function is called asynchronously.</returns>
				/// </signature>
			},
			merge: function(objTo, objFrom) {
				/// <summary>Recursively merge one object to another.</summary>
				/// <param name="objTo" type="Object">Base object to which all parameters and methods will be appended.</param>
				/// <param name="objFrom" type="Object">Source object from which all parameters and methods will be taken.</param>
				/// <returns type="Object">Merged object.</returns>
			},
			relocateCSS: function(cssText, oldCssLocation, newCssLocation) {
				/// <summary>Parses string of CSS and corrects all url() statements accordingly to new css-file location.</summary>
				/// <param name="cssText" type="String">String with CSS expression.</param>
				/// <param name="oldCssLocation" type="String" optional="true">URL of previous css-file location.</param>
				/// <param name="newCssLocation" type="String" optional="true">URL of new css-file location.</param>
				/// <returns type="String">New correct CSS string.</returns>
			},
			injectCSS: function(cssText, Attrs, el) {
				/// <summary>Insert STYLE element to document.</summary>
				/// <param name="cssText" type="String">Styles to be injected.</param>
				/// <param name="Attrs" type="Object" optional="true">HTML attributes of new DOM element.</param>
				/// <param name="el" type="HTMLElement" optional="true">Existing STYLE element, to which insert styles.</param>
				/// <returns type="HTMLElement">STYLE object.</returns>
			},
			injectJS: function (jsText, Attrs, el) {
				/// <summary>Insert SCRIPT element to document.</summary>
				/// <param name="jsText" type="String">JavaScript expression to be injected.</param>
				/// <param name="Attrs" type="Object" optional="true">HTML attributes of new DOM element.</param>
				/// <param name="el" type="HTMLElement" optional="true">Existing SCRIPT element, to which insert expression.</param>
				/// <returns type="HTMLElement">SCRIPT object.</returns>
			},
			injectHTML: function (htmlText) {
				/// <summary>Inserts content as HTML to document.</summary>
				/// <param name="htmlText" type="String">Text content to be injected.</param>
				/// <returns type="String">String of text content.</returns>
			},
			addDOMEvent: function(elem, type, handler) {
				/// <summary>Crossbrowser add event listener.</summary>
				/// <param name="elem" type="HTMLElement">Element.</param>
				/// <param name="type" type="String">Event type.</param>
				/// <param name="handler" type="Function">Callback.</param>
				/// <returns type="undefined"></returns>
			},
			removeDOMEvent: function(elem, type, handler) {
				/// <summary>Crossbrowser remove event listener.</summary>
				/// <param name="elem" type="HTMLElement">Element.</param>
				/// <param name="type" type="String">Event type.</param>
				/// <param name="handler" type="Function">Callback.</param>
				/// <returns type="undefined"></returns>
			}
		},
		/// <field type='Object'>Functions for URL processing.</field>
		URL: {
			randomize: function(url) {
				/// <signature>
				/// <summary>Adds a parameter with random value, if not exists.</summary>
				/// <param name="url" type="String">URL or path string.</param>
				/// <returns type="String">Updated URL.</returns>
				/// </signature>
			},
			isExternal: function(url) {
				/// <signature>
				/// <summary>Checks if URL is not in the same domain.</summary>
				/// <param name="url" type="String">URL or path string.</param>
				/// <returns type="Boolean">true or false.</returns>
				/// </signature>
			},
			isAvailable: function(url) {
				/// <signature>
				/// <summary>Synchronously checks file by url for existence/availability.</summary>
				/// <param name="url" type="String">URL or path string.</param>
				/// <returns type="Boolean">true or false.</returns>
				/// </signature>
			},
			isAvailableAsync: function(url) {
				/// <signature>
				/// <summary>Asynchronously checks file by url for existence/availability.</summary>
				/// <param name="url" type="String">URL or path string.</param>
				/// <returns type="Promise">Promise, which value is true or false.</returns>
				/// </signature>
			},
			normalize: function(url) {
				/// <signature>
				/// <summary>Normalizes paths.</summary>
				/// <param name="url" type="String">URL or path string.</param>
				/// <returns type="String">Valid URL.</returns>
				/// </signature>
			},
			parse: function (url) {
				/// <signature>
				/// <summary>Parses string as URL expression.</summary>
				/// <param name="url" type="String">URL or path string.</param>
				/// <returns type="Object">Object, that represents URL parts.</returns>
				/// </signature>
			}
		},
		/// <field type='Object'>App configuration.</field>
		config: {
			/// <field type='String'>Default home URL.</field>
			baseUrl: '.',
			/// <field type='Boolean'>Enables default browser's http cache.</field>
			cache: false,
			/// <field type='Boolean'>Enables caching for image resources. Ignored if `cache` is false.</field>
			cacheImages: false,
			/// <field type='Boolean'>Enables caching for media resources. Ignored if `cache` is false.</field>
			cacheMedia: false
		},
		invoke: function(eventType, detail) {
			/// <summary>Generates event in Core with attached details data.</summary>
			/// <param name="eventType" type="String">Event type.</param>
			/// <param name="detail" type="Object" optional="true">Details.</param>
			/// <returns type="Object">Core</returns>
			return this;
		},
		listen: function(eventType, handler) {
			/// <summary>Adds Core event listeners in runtime. This is an alternative way to add listener of Core events.</summary>
			/// <param name="eventType" type="String">Event type.</param>
			/// <param name="handler" type="Function">Callback handler.</param>
			/// <returns type="Object">Core</returns>
			return this;
		},
		action: function(actionType, detail) {
			/// <summary>Generates action in Core with attached details data.</summary>
			/// <param name="actionType" type="String">Action type.</param>
			/// <param name="detail" type="Object" optional="true">Details.</param>
			/// <returns type="Object">Core</returns>
			return this;
		},
		/// <field type='Object'>Feature detection collection.</field>
		Features:  {
			/// <field type='Boolean'>Detect touch device/browser.</field>
			'touch': false,
			/// <field type='Boolean'>Detect high resolution (retina) display.</field>
			'retina': false
		},
		configure: function(config) {
			/// <signature>
			/// <summary>Method for extending Core.config object. Old values will be overwritten with new ones.</summary>
			/// <param name="config" type="Object">Configuration properties</param>
			/// <returns type="Object">Core</returns>
			/// </signature>
			/// <signature>
			/// <summary>Method for extending Core.config object. Old values will be overwritten with new ones. File will be loaded synchronously with same domain policy.</summary>
			/// <param name="url" type="String">URL of the file with a configuration object</param>
			/// <returns type="Object">Core</returns>
			/// </signature>
		},
		include: function (path) {
			/// <summary>Includes files in document, if they are available: index.html, style.css, ie.css, register.js.</summary>
			/// <param name="path" type="String">Path to component directory in which files are located.</param>
			/// <returns type="Promise">Results of resources load.</returns>
			return Promise.some();
		},
		register: function(moduleName, moduleBody) {
			/// <signature>
			/// <summary>Register new module in Core Registry. If module with given name already registered, it will be overwritten.</summary>
			/// <param name="moduleName" type="String">Module name.</param>
			/// <param name="moduleBody" type="Function">Constructor of module object.</param>
			/// <returns type="Object">Core</returns>
			/// </signature>
			if (typeof moduleBody === 'function') {
				_eventManager.add(this, 'register', moduleBody.bind(new moduleBody(new Sandbox), new Sandbox))//do magic
			}
			return this;
		},
		start: function(moduleName/*,args*/) {
			/// <signature>
			/// <summary>Initializes module(s), if registered.</summary>
			/// <param name="moduleName" type="String">Module name to be initialized.</param>
			/// <param name="otherModuleName" type="String" optional="true">Other module name to be initialized.</param>
			/// <returns type="Promise">Result of module(s) initialization.</returns>
			/// </signature>
			return Promise.some();
		},
		stop: function(moduleName/*,args*/) {
			/// <signature>
			/// <summary>Destroys module(s), if registered.</summary>
			/// <param name="moduleName" type="String">Module name to be destroyed.</param>
			/// <param name="otherModuleName" type="String" optional="true">Other module name to be destroyed.</param>
			/// <returns type="Promise">Result of module(s) distruction.</returns>
			/// </signature>
			return Promise.some();
		},
		startAll: function() {
			/// <summary>Initializes all registered modules.</summary>
			/// <returns type="Promise">Result of modules initializations.</returns>
			return Promise.any();
		},
		stopAll: function() {
			/// <summary>Destroys all initialized modules</summary>
			/// <returns type="Promise">Result of modules distructions.</returns>
			return Promise.any();
		},
		extend: function(extendFunc) {
			/// <signature>
			/// <summary>Extends Core object with new properties and methods.</summary>
			/// <param name="extendFunc" type="Function">Function, that returns object to be merged to Core.</param>
			/// <returns type="Object">Core</returns>
			/// </signature>
			/// <signature>
			/// <summary>Extends Core object with new properties and methods.</summary>
			/// <param name="extendObject" type="Object">Object to be merged to Core.</param>
			/// <returns type="Object">Core</returns>
			/// </signature>
			_eventManager.add(this, 'extend', extendFunc.bind(undefined, CorePrivate, Sandbox))//do magic
			return this;
		}
	}

	
	
	//refer comments to original object
	//intellisense.annotate(window, {
	//	/// <field name='Core' type='Object'>Application Core global namespace.</field>
	//	Core: Core
	//})
	intellisense.annotate(Core, {
		load: CorePrivate.load,
		/// <field type='Promise'>Promise of document 'DOMContentLoaded'.</field>
		DOMReady: CorePrivate.DOMReady,
		/// <field type='Promise'>Promise of window 'load'.</field>
		DOMLoaded: CorePrivate.DOMLoaded,
		/// <field type='Promise'>Promise of included and loaded UI modules.</field>
		UIReady: CorePrivate.UIReady,
		configure: CorePrivate.configure,
		include: CorePrivate.include,
		register: CorePrivate.register,
		start: CorePrivate.start,
		stop: CorePrivate.stop,
		startAll: CorePrivate.startAll,
		stopAll: CorePrivate.stopAll,
		extend: CorePrivate.extend
	})

	Core.extend(function(Core, Sandbox) {
		intellisense.annotate(Core, CorePrivate)
		
		intellisense.annotate(Core.Promise, Promise)
		intellisense.annotate(Core.Promise.all, Promise.all)
		intellisense.annotate(Core.Promise.any, Promise.any)
		intellisense.annotate(Core.Promise.some, Promise.some)
		intellisense.annotate(Core.Promise.isPromise, Promise.isPromise)
		intellisense.annotate(Core.Promise.prototype, Promise.prototype)
		
		intellisense.annotate(Core.Util, CorePrivate.Util)
		intellisense.annotate(Core.URL, CorePrivate.URL)
		intellisense.annotate(Core.config, CorePrivate.config)
		intellisense.annotate(Core.Features, CorePrivate.Features)
		
		intellisense.annotate(Sandbox, SandboxConstructor)
		intellisense.annotate(Sandbox.prototype, SandboxConstructor.prototype)	
	})


	
	
	
								/*Reference END*/


	



	//INFO: statementcompletion event object `items` array property structure
	/*[{
		name: '',//property name
		kind: '', //field|method
		scope: '', //member|
		value: {}, //value of property itself
		glyph: '',
		_$group: 1,
		parentObject: Core,
		comments: ''
	}]*/

	//filter underscored properties
	intellisense.addEventListener('statementcompletion', function(event) {
		var filterRegex;

		if (event.targetName === "this")
			filterRegex = /^__.*__$/;
		else if (event.target === undefined || event.target === window)
			filterRegex = /^_(?:_.*__$|.*\d{2,})/;
		else
			filterRegex = /^_/;

		event.items = event.items.filter(function(item) {
			return !filterRegex.test(item.name);
		});
	})

	intellisense.addEventListener('statementcompletion', function(e) {
		//filter unnecessary properties in `Core` object
		if (/^(Core|Features|config)$/.test(e.targetName)) {
			e.items = e.items.filter(function(item) {
				return !(item.value && item.value.toString && /\[native\scode\]/.test(item.value.toString()));
			})
		}

		//filter unnecessary properties in `sandbox` instance object
		else if (e.targetName === 'sandbox' && e.items.some(function(el) {return el.name == 'moduleName' })) {
			e.items = e.items.filter(function(item) {
				return !(
					(item.value && item.value.toString && /\[native\scode\]/.test(item.value.toString()))
					|| item.name === 'constructor'
				)
			})
		}

	})


	//intellisense.addEventListener('statementcompletion', function(e) {
	//	intellisense.logMessage(e.target ? 'member list requested, target: ' + e.targetName : 'statement completion for current scope requested')
	//	intellisense.logMessage('scope ' + e.scope)
	//	// Prints out all statement completion items.
	//	e.items.forEach(function(item) {
	//		intellisense.logMessage('[completion item] ' + item.name + ', kind:' + item.kind + ', scope:' + item.scope + ', value:' + item.value)
	//	})
	//})

}());





