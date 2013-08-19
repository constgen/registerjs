<h1 id="core">Core Reference</h1>


<h3>Core.Promise({function}|{*}, {optional function canceler})</h3>
<p>Constructor of Promise-objects. Such objects are a software abstraction that makes working with asynchronous operations much more pleasant. After end of the action (doesn`t matter if it failed or not) Promise-object considered fullfilled. To create new object you need to use operator <code>new</code>. You pass in function as a parameter, arguments of this function links to a callback function of each event. This may provide all scenarios fulfillment of such object.
</p>

<pre><code>var examplePromise = new Core.Promise(function(complete, error, progress){
 complete(val) - called when action is sucessfully completed
	error(val) - called when a action fails
	progress(val) - called many times during fulfillment process until it will be resolved with complete() or error()
	val - any value that can be passed to callback function
})</code></pre>

<p>Handlers are added to Promise using method <code>.then(callback, errorback, progressback)</code>:</p>
<pre><code>examplePromise.then(
		function done(){}, 
		function error(){}, 
		function progress(){}
	)</code></pre>

<p>You may add any amount of handlers in any time after Promise-object was created. They will perform strictly in the order that they were added and only once after Promise fulfillment. A promise that is resolved with a value remembers the fulfillment. If a callback is attached in the future to this promise, it will be executed with the previously resolved value.  Promises behave the same way regardless of whether they are already resolved or resolved in the future.</p>

<p>If there is no function in Promise constructor then it will never be fulfilled</p>
<pre><code>new Core.Promise('never resolved')</code></pre>
<p>Core.Promise can be used to wrap some value. For example:</p>
<pre><code>Core.Promise(5)</code></pre>
<p>This expressin returns resolved Promise-object with context <code>5</code>. It means you can add handler for fulfillment or rejection with value <code>5</code></p>
<pre><code>Core.Promise(5).then(function(val){ val equal 5 })</code></pre>

<p>This technique can be useful when we have value, but want them to use as a Promise-object, for example: if expected that function returns Promise, then we just wrap it with Promise-object.</p>
<p>Presence of operator <code>new</code> leads to different operations. Make differrence on constructor call and wrapping</p>

<p>Promise-object context can be changed within handler that was called with method <code>.then({callback}, {errorrback}, {progressback})</code>. If handler returns some value, then it will replace context of Promise object and next handlers will be called with new context. If handler doesn't return anything or returns <code>undefined</code> then context doesn't change.</p>
<p>Context can be any value, but if this value will be another Promise object, it will affect behaviour of existing Promise object. All handlers that assigned after handler will execute only after new Promise fulfillment. This way you can create asynchronious functions chain. For example:</p>

<pre><code>examplePromise.then(function(val){
	//val = undefined
	return 1;
})
examplePromise.then(function(val){
	//val = 1
	return;
})
examplePromise.then(function(val){
	//val = 1
	return 2;
})
examplePromise.then(function(val){
	//val = 2
})
</code></pre>
<pre><code>
  var examplePromise = new Core.Promise(function(...){...}),
  anotherPromise = new Core.Promise(function(...){...});
  examplePromise.then(function(val){
  //val = undefined
  return 1;
  })
  examplePromise.then(function(val){
  //val = 1
  return anotherPromise;
  })
  examplePromise.then(function(val){
  //this handler and all next handlers will be executed only after `anotherPromise` will successfully fulfilled
  //val = undefined
  return 2;
  })
  examplePromise.then(function(val){
  //val = 2
  })
</code></pre>

<p>You may cancel Promise execution using <code>.cancel()</code> method:</p>
<pre><code>examplePromise.then(
	function done(){}, 
	function error(err){console.error(err.message)}, 
	function progress(){}
)
examplePromise.cancel()
//console message - Error: Canceled
	</code></pre>
<p>If a promise is cancelled then such object can not fulfill successfully. If at the moment of cancelling it was already fullfilled with any status then this cancellation is ignored.</p>
<pre><code>examplePromise = Core.Promise(5) //fulfilled successfully 
examplePromise.then(
	null, 
	function error(err){console.error(err.message)}
)
examplePromise.cancel()
//nothing in console</code></pre>
<p>Method <code>.cancel()</code> can change not only status of your Promise object, but stop all actions that are performed until fulfillment. For example if Promise function makes asynchronious request, when it is cancelled Promise object changes it state in fullfilled with error also it prevents request itself for perfomance and efficiency. All actions for stopping asynchronious functions must be provided while creating new Promise object using constructor <code>new Core.Promise({function}, {optional function canceler})</code>. `{optional function canceler}` - this function will be called when Promise is cancelled. For example this function may stop async request, as server response will be no longer actual it will be better to free browser resources for more important tasks</p>

<p>Promise object has many other auxiliary methods</p>
<ul>
  <li>
    <code>.timeout({Number miliseconds})</code> - create delay before cancelling Promise if it did not finish earlier;
  </li>
  <li>
    <code>.wait({Number miliseconds})</code> - create delay before Promise object will be forced to successfully fulfill without context if it did not finish earlier;
  </li>
  <li>
    <code>.interval({Number miliseconds})</code> - call proggress callback with interval without context until Promise will be fulfilled;
  </li>
  <li>
    <code>.delay({Number miliseconds})</code> - add delay between handler `callback` and `errorback` execution. Doesn't affect `progressback` handler;
  </li>
  <li>
    <code>.and({Object Promise})</code> - applies that current Promise can not be completed successfully before will be completed successfully passed in the argument `{Object Promise}`. If `{Object Promise}` resolved with error then current Promise will resolve with same error.
  </li>
</ul>

<h3 id="core-every">Core.every({array|arguments Promises})</h3>
<p>Returns Promise-object which will be resolved when all passed in Promise objects will be resolved (order doesn't matter)</p>
<p>Fulfills successfully if all Promise objects successfully fulfilled. Context will have array of all contexts in order that they were specified in arguments<br>
Fulfilles with an error if at least one of Promises Fulfilled with an error. Context will have context with error of first Promise that fulfilled with an error.</p>
<p>As arguments can be passed in array, many arguments separated with comma, many arrays, arrays mixed with arguments, they all will be combined in specified order:</p>
<pre><code>Core.every(promise1, promise2, promise3)
Core.every([promise1, promise2, promise3])
Core.every([promise1, promise2], promise3, [promise4, promise5])</code></pre>
<p>Also <code>Core.every()</code> automatically creates promise wrap if argument isn't Promise object. If argument is a function it immediately executes and context of Promise fills with function result:</p>
<pre><code>Core.every([promise1, promise2], 5, ['resolved value', function(){ return 1}]).then(
	function success(val){
		conole.log(
			val[0], // {context of promise1}
			val[1], // {cpntext of promise2}
			val[2], // 5
			val[3], // 'resolved value'
			val[4], // 1
		)
	}
)</code></pre>


<h3 id="core-any">Core.any({array|arguments Promises})</h3>
<p>
  Like <code>Core.every()</code>, but with some differencies. It still returns Promise object that will be resolved when all passed in Promise objects will be resolved. But it will successfully resolve with any fulfillment results passed in arguments Promise objects. Context will be array of every context in specified order. But in this case context array may consist of values or errors. Better to use it when you need to make some of asynchronious actions and it doesn't matter wether they fulfill successfully or not and then execute handler.
</p>
<p>
  <code>Core.any()</code> can not never will be resolved with error, except when it was cancelled using <code>.cancel()</code> method
</p>

<p>For <code>Core.every()</code> and <code>Core.any()</code> method <code>.cancel()</code> also cancel actions of all passed in Promise objects.</p>


<h3 id="core-load">Core.load({string URL | array URLs}, {object Options})</h3>
<p>
  Loads resources in document. Supported resource types: JavaScript, Image, CSS, Text Document. Type is automatically recognized by file extension. This function returns Promise object, so you can use corresponding methods <code>then()</code>, <code>cancel()</code> and others</p>
<p>{string URL} - string, you can use a variable of type {***}.</p>
<p>{array URLs} - first parameter can be array of URL`s. This is convenient for faster entry call `Core.load()` to load multiple resources</p>
<p>By default resource loads in synchronously and it's code can be used right after Core.load() function call. It means that all synchronous loads are executed strict in specified order and it can only load single resource at the same time. But a lot of resources can slow download speed. That is why you can change behaviour to asynchronous</p>
<p>
  {object Options} - object, its properties get values <code>true</code> or <code>false</code>. Available properties <code>defer</code>, <code>async</code>, <code>reload</code>. All properties have values by default <code>false</code>. If first parameter {array URLs} is array, then these properties become common for every resource in array.
</p>
<p>
  Options{defer: true} - resource load does not stop the flow of execution, and is loaded in the background. These files can be loaded in parallel of more than one and are executed in the order in which they are specified. To handle the load end of the file you need to use <code>.then()</code>.
</p>
<p>
  Options{async: true} - prevents defer behaviour. These files are always loaded and executed in parallel at once both completed their loading. They do not have the order of execution.This method is used for JavaScript которые which is not a member in connection with other files and initialization time is not a priority (form validation for example). To handle the load end of the file you need to use <code>.then()</code>.
</p>
<p>
  Options{reload: true} - By default, the loader will not load the same resource multiple times, but fulfill Promise, if URL was used again. But this behavior can be prevented using the flag <code>reload</code>. With this flag resource always reloads.<p>

<p>Usage example <code>Core.load</code>:</p>
<pre><code>Core.load('{baseUrl}/libs/jquery.js', {async: true})</code></pre>

<p>
  {object Options} also can be string of flags separated by comma and spaces. Flag availability means value of the corresponding property <code>true</code> , absence - <code>false</code>. {defer: true, reload: true} will be like this "defer, reload" or "defer reload". Usage example:
</p>
    
<p>In most cases use {defer: true}. Example:</p>
<pre><code>Core.load('{baseUrl}/libs/jquery.js', 'defer')</code></pre>
