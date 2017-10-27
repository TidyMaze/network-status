var currentState = 'UNKNOWN';
var maxLengthHistory = 30;

var stateHistory = [];

var interval;

var optionsService = new OptionsService();
var options;

optionsService.restore_options(restoredOptions => {
	options = restoredOptions;
	console.log('Restored : ', options);
	scheduleBackgroundTasks();
})

function scheduleBackgroundTasks(){
	if(interval) clearInterval(interval);
	interval = setInterval(()=> {
		var samplePromises = [];
		for (var i = 0; i < options.nbSamples; i++) {
			samplePromises.push(isNetworkWorking());
		}

		Promise.all(samplePromises).then(results => {
			var stats = {
				time: '' + new Date(),
				upCount: results.filter(r => r === true).length,
				downCount: results.filter(r => r === false).length
			};
			console.log('stats : ' + JSON.stringify(stats))
			var working = stats.upCount > stats.downCount;
			if(working){
				console.log('network is up!');
				setNetworkUp();
			} else {
				console.log('network is down!');
				setNetworkDown();
			}

			stateHistory.push(stats);

			if(stateHistory.length > maxLengthHistory) stateHistory.splice(0, stateHistory.length-maxLengthHistory);

			notifyState(stateHistory);
		});
	}, options.interval);
}



chrome.storage.onChanged.addListener((changes, areaName) => {
	console.log('change storage : ' + JSON.stringify(changes) + ' ' + areaName);
	for(var prop in changes){
		console.log('Changed ' + prop + ' from ' + changes[prop].oldValue + ' to ' + changes[prop].newValue);
		dispatch(prop, changes[prop]);
	}
});

function dispatch(setting, change){
	var handlers = {
		'url': handleChangeUrl,
		'timeout': handleChangeTimeout,
		'interval': handleChangeInterval,
		'nbSamples': handleChangeNbSamples,
	};
	var handler = handlers[setting];
	if(!handler) console.log('No handler found for setting ' + setting);
	options[setting] = change.newValue;
	handler(setting, change);
}

function handleChangeUrl(setting, change){

}

function handleChangeTimeout(setting, change){
	scheduleBackgroundTasks();
}

function handleChangeInterval(setting, change){

}

function handleChangeNbSamples(setting, change){

}

function setNetworkUp(){
	if(currentState != 'UP'){
		chrome.browserAction.setIcon({
			path: '/images/connected.png'
		});
		currentState = 'UP';
	}
}

function setNetworkDown(){
	if(currentState != 'DOWN'){
		chrome.browserAction.setIcon({
			path: '/images/disconnected.png'
		});
		currentState = 'DOWN';
	}
}

function isNetworkWorking(){
	var p = new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.onreadystatechange = function(event) {
		    if (this.readyState === XMLHttpRequest.DONE) {
	            return resolve(this.status === 200);
		    }
		};
		req.timeout = options.timeout;
		req.open('GET', options.url + ((/\?/).test(options.url) ? "&" : "?") + (new Date()).getTime(), true);
		req.send(null);
	});
	return p;
}

function notifyState(stateHistory){
	console.log('Sending ' + JSON.stringify(stateHistory));
	chrome.runtime.sendMessage({history: stateHistory}, function(response) {
	  console.log(response);
	});
}