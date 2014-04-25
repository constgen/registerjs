
// Google Analytics
Core.extend(function (Core) {
	'use strict';

	//needs global variable for Google Analitics script
	window._gaq = window._gaq || [];

	var undefined,
		userAccount = Core.config.googleAnalyticsAccount || 'UA-123456-78', //!!!
		_gaq = window._gaq;

	window._gaq.push(['_setAccount', userAccount])
	window._gaq.push(['_trackPageview'])

	//https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide?hl=ru

	//load analitics script
	Core.load(('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js', {async: true})

	//For media marketing
	//Core.load( ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js' , {async: true})

	//action handler
	function trackEvent(detail) {
		/*
		Google Reference
		detail.category - The name you supply for the group of objects you want to track.
		detail.action - A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object. 
		detail.label - An optional string to provide additional dimensions to the event data. 
		detail.value - An integer that you can use to provide numerical data about the user event. 
		detail.noninteraction - A boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation.
		*/
		window._gaq.push(['_trackEvent', detail.category, detail.action, detail.label, parseInt(detail.value, 10) || null, detail.noninteraction]);
	}

	//action handler
	function trackPage(detail) {
		/*
		detail.url - URL of any (even not existing) page
		*/
		window._gaq.push(['_trackPageview', detail.url]);
	}

	return {
		actions: {
			'trackEvent': trackEvent,//legacy
			'event-track': trackEvent,
			'page-track': trackPage
		}
	}

})
