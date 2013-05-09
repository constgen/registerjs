<h1>Module Sandbox Reference</h1>

<h2>Module</h2>
<p>
Модуль в предложеной струтуре - это JavaScript объект, который работает обособленно от всей системы, а для связи с приложением использует <code>sandbox</code>. Для того чтобы его использовать, его всегда нужно сперва зарегистрировать. Любой модуль должен иметь уникальное имя в системе и содержать обязательный метод <code>init</code>. Пример:
</p>
<pre><code>Core.register('firstModule', {
	init: function(){
		//module started his life
	}
})</code></pre>
<p>Так же у модуля могут быть не обязательные свойства и методы, такие как <code>listen</code> и <code>destroy</code>.</p>
<p><code>init</code>, <code>destroy</code>, <code>listen</code> - это зарегистрированые структурой имена свойств.</p>
<pre><code>Core.register('secondModule', {
	init: function(){
		//start module's life: attach bindings, show content, etc.
	},
	destroy: function(){
		//end module's life: detach bindings, remove content, etc.
	},
	listen: {
		'app-load': function(detail){},
		'content-update': [
			function(detail){},
			function(detail){}
		]
	}
})</code></pre>
<p>
Это был упрощённый способ регистрации модуля. Более развёрнутый метод предпологает наличие <code>sandbox</code> объекта, поэтому вместо объекта используется функция которая исполняется немедленно и возвращает объект модуля.
</p>
<pre><code>Core.register('thirdModule', function(sandbox){
	return {
		init: function(){
			//has access to sandbox
			//start module's life: attach bindings, show content, etc.
		},
		destroy: function(){
			//has access to sandbox
			//end module's life: detach bindings, remove content, etc.
		},
		listen: {
			'app-load': function(detail){
				//has access to sandbox
			},
			'content-update': [
				function(detail){},
				function(detail){}
			]
		}
	}
})</code></pre>
<p>
<code>sandbox</code> - объект к которому модуль может обращаться для получения доступа к функциям приложения. Его описание будет ниже.
</p>

<p>
Если модуль будет иметь значение <code>0</code>, <code>false</code>, <code>null</code> или <code>undefined</code> то ничего не зарегистрируется под указанным именем.
</p>

<p>
На практике модуль используется в связке с фрагментом HTML, который он обслуживает. Ниже приведён пример рекомендумого способа регистрации модуля.
</p>
<pre><code>Core.register('thirdModule', function(sandbox){
	return (function (root) {
		// if root element is undefined do not register module
		if (!root) return
		// create reference to module object
		var module = {
			init: function () {	},

			destroy: function () {},

			myMethod: function(){ 
				//has access to module.myProp and other
			},

			myProp: {},

			listen: {}
		}
		// return module object
		return module;
	}(document.querySelector('.moduleElement'))) // root HTML element
})</code></pre>
<p>
<code>root</code> - корневой HTML-элемент. Если элемент не найден то модуль не регистрируется.<br>
<code>module</code> - cсылка на объект самого модуля. Используется для доступа к методам модуля в любой части его кода.<br>
<code>myMethod</code>, <code>myProp</code> - ваши личные свойства и методы. Они всегда могут получить доступ к любой части модуля т.к. им доступна ссылка <code>module</code>, и как уже сказано ранее им доступен объект <code>sandbox</code>.
</p>

<br>
<h2 id="sandbox">Sandbox</h2>

<h3>sandbox.action({string Event}, {object Detail})</h3>

<h3>sandbox.listen({string Event}, {function Handler})</h3>


<h3>sandbox.hasFeature({string})</h3>
<p>Возвращает <code>true</code> или <code>false</code> состояние поддержки браузером указанной технологии. Если поддержка не может быть проверена то возвращает <code>false</code>. Названия характеристик делятся на 3 группы: JavaScript, CSS, HTML. Соответственно их записи начинаются с префиксов 'js-', 'css-', 'element-'. Так же имеются общие характеристики, которые не относятся к группам, они записываются без префиксов.</p>
<p>
Список стандартных характеристик, которые доступны всегда:<br>
<code>'css-transform3d'</code><br>
<code>'css-transform'</code><br>
<code>'css-transition'</code><br>
<code>'css-animation'</code><br>
<code>'css-box-shadow'</code><br>
<code>'css-background-size'</code><br>
<code>'css-border-image'</code><br>
<code>'css-columns'</code><br>
<code>'css-border-radius'</code><br>
<code>'css-opacity'</code><br>
<code>'element-svg'</code><br>
<code>'touch'</code><br>
<code>'retina'</code><br>
<code>'cordova'</code><br>
</p>
<p>
Остальные доступны только при подключении расширения 'features.core.js'.<br>
<code>'element-canvas'</code><br>
<code>'element-input[type=range]'</code><br>
<code>'js-webStorage'</code><br>
(Здесь список будет пополняться в дальнейшем)
</p>

<h3>sandbox.template({string})</h3>
<p>Преобразует любую строку с переменными вида {variable} в строку со значениями этих переменных. Переменные используются для абстрагирования от окружения в котором исполняется приложение. Пример:</p>
<code>sandbox.template('{baseUrl}/plugins/lightbox.js') // -> http://github.com/plugins/lightbox.js</code>
<p>
Доступные переменные:
<code>{baseUrl}</code> - адрес к корневой папке приложения<br>
??????????????????????
</p>


<h3>sandbox.alert({string Message}, {object Options})</h3>
<p>Универсальная функция для всех платформ. Аналог <code>alert()</code> из браузера. Возвращает Promise object (т.к. может быть асинхронным), который успешно завершается со значением <code>true</code> при нажатии на кнопку OK.</p>

<h3>sandbox.confirm({string Message}, {object Options})</h3>
<p>Универсальная функция для всех платформ. Аналог <code>confirm()</code> из браузера. Возвращает Promise object (т.к. может быть асинхронным), который успешно завершается со значением <code>true</code> при нажатии на кнопку OK или со значением <code>false</code> при нажатии на кнопку CANCEL.</p>

<h3>sandbox.notification({string Message}, {object Options})</h3>
<p>Универсальная функция для всех платформ. Аналог <code>window.webkitNotifications</code> из браузера. Возвращает Promise object, который успешно завершается со значением <code>true</code> при нажатии на всплывающее сообщение или со значением <code>false</code> при нажатии на кнопку закрытия сообщения.</p>


<h3>sandbox.data({*}).format({string})</h3>

<h3>sandbox.data({*}).filter({string})</h3>

<h3>sandbox.data({*}).sort({string})</h3>

<h3>sandbox.Event</h3>

<h3>sandbox.load({string URL}, {object Options})</h3>
<p>Алиас на <code>Core.load({string URL}, {object Options})</code></p>

<h3>sandbox.Promise({function}|{*}, {optional function canceler})</h3>
<p>Алиас на <code>Core.Promise({function}|{*}, {optional function canceler})</code></p>



<br>
<h1 id="core">Core Reference</h1>


<h3>Core.Promise({function}|{*}, {optional function canceler})</h3>
<P>Конструктор Promise-объектов. Такие объекты удобны для совершения асинхронных действий. После завершения такого действия (не важно как, успешно или с ошибкой) Promise-объект считается завершённым. Для создания нового объекта следует использовать оператор <code>new</code>. В качестве параметра передаётся функция, аргументы которой ссылаются на функции callback каждого из возможных событий. Т.о. можно предусмотреть все сценарии решения такого объекта. Пример:</p>

<pre><code>var examplePromise = new Core.Promise(function(complete, error, progress){
	complete(val) - вызывается когда действие прошло успешно
	error(val) - вызывается когда действие завершилось ошибкой
	progress(val) - вызывается много раз в процессе исполнения до тех пор пока не вызовется complete() или error()
	val - любое значение которое может быть переданно в callback
})</code></pre>

<p>Обработчики добавляются к Promise с помощью метода <code>.then(callback, errorback, progressback)</code>:</p>
<pre><code>examplePromise.then(
		function done(){}, 
		function error(){}, 
		function progress(){}
	)</code></pre>
<p>Можно добавить любое количество обработчиков в любое время как только Promise-объект был создан. Все они будут исполняться строго в том порядке в котором были добавлены и только 1 раз после завершения Promise-объекта. Если они добавляются после завершения Promise-объекта то будут выполнены немедленно, при чём контекст (значение которое передаётся обработчикам всех 3 типов) будет сохранено специально для таких вызовов, т.е. Promise-объекта запоминает своё последнее состояние.</p>
<p>Если в конструктор передать не функцию, а любое другое значение, то такой Promise-объект не завершится никогда - не будет вызван ни один из обработчиков.</p>
<pre><code>new Core.Promise('never resolved')</code></pre>
<p>Core.Promise может быть так же использован и как функция для приведения к типу. Например:</p>
<pre><code>Core.Promise(5)</code></pre>
<p>Это выражение вернёт успешно разрешённый Promise-объект с сохранённым контекстом <code>5</code>. Т.е. к нему можно добавить обработчик успешного завершения, в который будет передано значение <code>5</code>.</p>
<pre><code>Core.Promise(5).then(function(val){ здесь val равно 5 })</code></pre>
<p>Такой приём может быть удобен, когда мы имеем значение но хотим использовать его в виде Promise-объекта, Например: если от функции ожидается, что она вернёт Promise-объект а не значение, можно просто это значение привести к этому типу.</p>
<p>Т.о. наличие или отсутствие оператора <code>new</code> приводит к различным операциям. Не стоит путать вызов конструктора и приведение к типу.</p>

<p>Контекст Promise объекта может быть изменён внутри обработчика, добавленного через метод <code>.then({callback}, {errorrback}, {progressback})</code>. Если обработчик возвращает какое-то значение, то оно изменит контекст Promise объекта и следующие обработчики будут вызваны уже с новым контекстом. Если обработчик ничего не возвращает или возфращает <code>undefined</code>, то контекст не меняется.</p>
<p>В контекст можно поместить любое значение, но если это значение будет другим Promise объектом, то это сильно меняет поведение текущего Promise объекта. Все обработчики, которые добавлены после обработчика, возвращающего Promise, выполнятся только полсле завершения этого нового Promise. Таким образом можно создать цепочку из асинхронных функций, которые будут выполнятся одна за другой. Примеры:</p>
<pre><code>examplePromise.then(function(val){
	//здесь val = undefined
	return 1;
})
examplePromise.then(function(val){
	//здесь val = 1
	return;
})
examplePromise.then(function(val){
	//здесь val = 1
	return 2;
})
examplePromise.then(function(val){
	//здесь val = 2
})
</code></pre>
<pre><code>var examplePromise = new Core.Promise(function(...){...}),
	anotherPromise = new Core.Promise(function(...){...});
examplePromise.then(function(val){
	//здесь val = undefined
	return 1;
})
examplePromise.then(function(val){
	//здесь val = 1
	return anotherPromise;
})
examplePromise.then(function(val){
	//этот обработчик и все последующие за ним выполнятся, только когда `anotherPromise` будет завершён успешно
	//здесь val = undefined
	return 2;
})
examplePromise.then(function(val){
	//здесь val = 2
})
</code></pre>

<p>Выполнение Promise можно отменить с помощью метода <code>.cancel()</code>:</p>
<pre><code>examplePromise.then(
	function done(){}, 
	function error(err){console.error(err.message)}, 
	function progress(){}
)
examplePromise.cancel()
//в консоли появится - Error: Canceled
	</code></pre>
<p>Promise объект завершается с ошибкой связанной с отменой ('Canceled'). Такой объект уже не сможет завершиться успешно. Но если на момент отмены он уже был завершён с любым статусом, то эта отмена игнорируется:</p>
<pre><code>examplePromise = Core.Promise(5) //завершённый успешно 
examplePromise.then(
	null, 
	function error(err){console.error(err.message)}
)
examplePromise.cancel()
//в консоли ничего не появится</code></pre>
<p>Метод <code>.cancel()</code> может менять не только статус объекта но и останавливать все действия, которые выполняются для завершения. Например, если функция Promise совершает асинхронный запрос на сервер то при её отмене, кроме перехода Promise объекта в завершённое состояние с ошибкой, так же будет отменён сам запрос на сервер, который не завршился, для экономии трафика и особождения канала браузера. Все действия по остановке деятельности асинхронных функций должны быть предусмотрены в момент создания Promise объекта с помощью конструктора <code>new Core.Promise({function}, {optional function canceler})</code>. `{optional function canceler}` - это функция, которая будет вызвана при отмене Promise объекта. В примере с запросом на сервер, в тело этой функции нужно поместить код для оставновки такого запроса, т.к. ответ от сервера уже будет не актуален и лучше освободить ресурсы браузера для более важных задач.</p>
<p>Так же у Promise объекта имеется множество других вспомогательных методов:</p>
<ul>
	<li><code>.timeout({Number miliseconds})</code> - создаётся таймер по окончанию которого Promise будет отменён, если он не успел завершиться;</li>
	<li><code>.wait({Number miliseconds})</code> - создаётся таймер по окончанию которого Promise будет принудительно завершён успешно без контекста, если он не успел завершиться;</li>
	<li><code>.interval({Number miliseconds})</code> - вызывает callback прогресса через заданный интервал без контекстадо тех пор пока Promise не будет завершён;</li>
	<li><code>.delay({Number miliseconds})</code> - добавляет искусственную задержку между выполнением обработчиков `callback` и `errorback`. Никак не влияет на обработчик `progressback`;</li>
	<li><code>.and({Object Promise})</code> - после применения этого метода к объекту, он не может завершиться успешно раньше, чем будет успешно завершён переданный в аргументе `{Object Promise}`. Если `{Object Promise}` завершится с ошибкой, то и текущий Promise тоже завершится с этой же ошибкой.</li>
</ul>


<h3 id="core-every">Core.every({array|arguments Promises})</h3>
<p>Возвращает Promise-объект который будет завершён, когда все переданные Promise-объекты будут завершены (не важно в каком порядке).</p>
<p>Завершается успешно если все Promise-объекты завершились успешно. Тогда в контекст будет передан массив всех контекстов в порядке как они были указаны в аргументах.<br>
Завершается с ошибкой если какой-то из Promise-объектов завершился неудачно. Тогда в контекст будет передан контекст ошибки Promise-объекта из списка, который первым завершился с ошибкой.</p>
<p>В качестве аргументов может принимать как массив, так и множество аргументов через запятую, так и множество масиввов, через запятую, так и в перемешку массивы с одиночными аргументами через запятую - все они будут объеденены в том порядке в котором были указаны:</p>
<pre><code>Core.every(promise1, promise2, promise3)
Core.every([promise1, promise2, promise3])
Core.every([promise1, promise2], promise3, [promise4, promise5])</code></pre>
Так же <code>Core.every()</code> автоматически приводит к нужнуму типу все входящие аргументами, если они не являются Promise. А если аргумент - это функция, она немедленно исполняется и в контекст созданного вместо неё Promise помещается значение которое вернула эта функция:
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
<p>Похож на <code>Core.every()</code>, но с некоторыми отличифми. Он всё так же возвращает Promise-объект который будет завершён, когда все переданные Promise-объекты будут завершены. Но он завершается успешно при любых результатх завершения переданных в аргументах Promise объектов. В контекст будет передан массив всех контекстов в порядке, как они были указаны в аргументах. Но в данном случае массив контекстов может содержать как значения так и ошибки. Его удобно использовать, если нужно совершить несколько асинхронных действий, при том не важно как они завершатся, и по окончанию выполнить некий обработчик.</p>
<p><code>Core.any()</code> не может быть завершён с ошибкой никогда за исключением единственного случая, когда он был отменён намеренно с помощью метода <code>.cancel()</code>, который есть у любого Promise объекта.</p>

<p>Для <code>Core.every()</code> и <code>Core.any()</code> метод <code>.cancel()</code> так же отменяет действия всех переданных в них Promise объектов.</p>






<h3 id="core-load">Core.load({string URL | array URLs}, {object Options})</h3>
<p>Загружает в документ ресурсы. Поддерживаемые типы ресурсов: JavaScript, Image, CSS, Text Document. Тип распознаётся автоматически по расширению файла. Эта функция возвращает объект Promise, поэтому к нему можно применить соответственные методы <code>then()</code>, <code>cancel()</code> и др.</p>
<p>{string URL} - строка с адресом, можно использовать переменные типа {***}.</p>
<p>{array URLs} - первый параметр так же может быть массивом из URL. Это удобно для более быстрой записи вызова `Core.load()` для загрузки нескольких ресурсов.</p>
<p>По умолчанию ресурс загружается синхронно и использовать его код можно сразу после вызова функции Core.load(). Это значит что всё синхронные загрузки исполняются строго в том порядке в котором их указали и одновременно загружаться может только 1 ресурс. Но большое количество синхронных запросов замедляют скорость загрузки. Поэтому поведение загрузки можно изменить на асинхронное.</p>
<p>{object Options} - объект, свойства которого принимают значения <code>true</code> или <code>false</code>. Доступные свойства <code>defer</code>, <code>async</code>, <code>reload</code>. Значения по умолчанию у всех <code>false</code>. Если первый параметр {array URLs} - массив, то эти опции становятся общими для каждого ресурса в массиве.</p>
<p>Options{defer: true} - загрузка ресурса не останавливает поток исполнения, а загружается в фоне. Такие файлы могут загружаться параллельно количесьвом больше одного и исполняются в том порядке, в котором их указали. Чтобы обработать окончание загрузки такого файла нужно использовать <code>.then()</code>.</p>
<p>Options{async: true} - отменяет поведение defer. Такие файла всегда загружаются параллельно и исполняются сразу же как завершили свою загрузку. У них нет порядка исполнения. Такой метод стоит использовать для JavaScript которые не состоит в связи с другими файлами и время инициализации не приоритетно (например, валидация полей форм). Чтобы обработать окончание загрузки такого файла нужно использовать <code>.then()</code>.</p>
<p>Options{reload: true} - По умолчанию загрузчик не будет загружать один и тот же ресурс несколько раз, а сразу завершит Promise, если URL был использован повторно. Но это поведение можно предотвратить использовав флаг <code>reload</code>. С ним ресурс всегда загружается заново.<p>

<p>Пример использования <code>Core.load</code>:</p>
<pre><code>Core.load('{baseUrl}/libs/jquery.js', {async: true})</code></pre>

<p>{object Options} так же может быть строкой из флагов разделённых запятыми или пробелами. Наличие флага означает значение соответствующего свойства <code>true</code> , отсутствие - <code>false</code>. {defer: true, reload: true} будет выглядеть так "defer, reload" или "defer reload". Пример использования:</p>
<pre><code>Core.load('{baseUrl}/libs/jquery.js', 'async, reload')</code></pre>

<p>В большинстве случаев рекомендуется использовать {defer: true}. Пример:</p>
<pre><code>Core.load('{baseUrl}/libs/jquery.js', 'defer')</code></pre>



