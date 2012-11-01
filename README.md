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

<h2>Sandbox</h2>

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



<h3>sandbox.load({string URL}, {object Options})</h3>
Загружает в документ ресурсы JavaScript или CSS. Тип распознаётся автоматически по расширению файла. 
{string URL} - строка с адресом, можно использовать переменные типа {*}/
По умолчанию ресурс загружается синхронно и использовать его код можно сразу после вызова функции sandbox.load(). Это значит что всё синхронные загрузки исполняются строго в том порядке в котором их указали и одновременно загружаться может только 2 ресурс. Но большое количество синхронных запросов замедляют скорость загрузки. Поэтому поведение загузки можно изменить на асинхронное.
{object Options} - объект, свойства которого принимают значения `true` или `false`. Доступные свойства `defer` и `async`. Значения по умолчанию у всех `false`.
{defer: true} - загрузка ресурса не останавливает поток исполнения его код будет доступен только за пределами файла в котором вызвали его загрузку или в следующем цикле исполнения браузера. Такие файлы могут загружаться количесьвом больше одного и исполняются в том порядке, в котором их указали.
{async: true} - отменяет поведение defer. Такие файла всегда загружаются параллельно и исполняются сразу же как завершили свою загрузку. У них нет порядка исполнения. Такой метод стоит использовать для JavaScript которые не состоит связи с другими файлами и время инициализации не приоритетно (например, валидация полей форм)
В большинстве случаев рекомендуется использовать {defer: true}. Пример использования:
sandbox.load('{baseUrl}/libs/jquery.js', {defer: true})



<h3>sandbox.Promise({function}|{*})</h3>
<P>Конструктор Promise-объектов. Такие объекты удобны для совершения асинхронных действий. После завершения такого действия (не важно как, успешно или с ошибкой) Promise-объект считается завершённым. Для создания нового объекта следует использовать оператор <code>new</code>. В качестве параметра передаётся функция, аргументы которой ссылаются на функции callback каждого из возможных событий. Т.о. можно предусмотреть все сценарии решения такого объекта. Пример:</p>

<pre><code>var example = new sandbox.Promise(function(complete, error, progress){
	complete(val) - вызывается когда действие прошло успешно
	error(val) - вызывается когда действие завершилось ошибкой
	progress(val) - вызывается много раз в процессе исполнения до тех пор пока не вызовется complete() или error()
	val - любое значение которое может быть переданно в callback
})</code></pre>

<p>Обработчики добавляются к Promise с помощью метода <code>.then(callback, errorback, progressback)</code>:</p>
<pre><code>example.then(
		function done(){}, 
		function error(), 
		function progress(){}
	)</code></pre>
<p>Можно добавить любое количество обработчиков в любое время как только Promise-объект был создан. Все они будут исполняться строго в том порядке в котором были добавлены и только 1 раз после решения Promise-объекта. Если они добавляются после решения Promise-объекта то будут выполнены немедленно, при чём контекст (значение которое передаётся обработчикам всех 3 типов) будет сохранено специально для таких вызовов, т.е. Promise-объекта запминает своё последнее состояние.</p>
<p>Если в конструктор передать не функцию, а любое другое значение, то такой Promise-объект не завершится никогда - не будет вызван ни один из обработчиков.</p>
<pre><code>new sandbox.Promise('never resolved')</code></pre>
<p>sandbox.Promise может быть так же использован и как функция для приведения к типу. Например:</p>
<pre><code>sandbox.Promise(5)</code></pre>
<p>Это выражение вернёт успешно разрешённый Promise-объект с сохранённым контекстом <code>5</code>. Т.е. к нему можно добавить обработчик успешного завершенияб в который будет передано значение <code>5</code>.</p>
<pre><code>sandbox.Promise(5).then(function(val){ здесь val равно 5 })</code></pre>
<p>Такой приём может быть удобен, когда мы имеем значение но хотим использовать его в виде Promise-объекта, Например: если от функции ожидается, что она вернёт Promise-объект а не значение, можно просто это значение привести к этому типу.</p>
<p>Т.о. наличие или отсутствие оператора <code>new</code> приводит к различным операциям. Не стоит путать вызов конструктора и приведение к типу.</p>



<h3>sandbox.when({array|arguments Promises})<\h3>
<p>Возвращает Promise-объект который будет завершён, когда все переданные Promise-объекты будут завершены (не важно в каком порядке).</p>
<p>Завершается успешно если все Promise-объекты завершились успешно. Тогда в контекст будет передан массив всех контекстов в порядке как они были указаны в аргументах.<br>
Завершается с ошибкой если все какой-то из Promise-объектов завершился неудачно. Тогда в контекст будет передан контекст ошибки Promise-объекта из списка, который первым завершился с ошибкой.</p>
<p>В качестве аргументов может принимать как массив, так и множество аргументов через запятую, так и множество масиввов, через запятую, так и в перемешку массивы содиночными аргументами через запятую - все они будут объеденены в том порядке в котором были указаны:</p>

<pre><code>sandbox.when(promise1, promise2, promise3)
sandbox.when([promise1, promise2, promise3])
sandbox.when([promise1, promise2], promise3, [promise4, promise5])</code></pre>
Так же <code>sandbox.when()</code> автоматически приводит к нужнуму типу все входящие аргументами если они не являются Promise. А если аргумент - это функция, она немедленно исполняется и в контекст созданного вместо неё Promise помещается значение которое вернула эта функция:
<pre><code>sandbox.when([promise1, promise2], 5, ['resolved value', function(){ return 1}]).then(
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


<h3>sandbox.get</h3>
<h3>sandbox.set</h3>