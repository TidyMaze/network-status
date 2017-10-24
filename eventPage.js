var currentState = 'UNKNOWN';

var intervalMS = 10000;
var timeoutMS = 5000;
var nbSamples = 5;
var maxLengthHistory = 30;
var url = 'https://www.google.com/';

var stateHistory = [];

setInterval(()=> {

	var samplePromises = [];
	for (var i = 0; i < nbSamples; i++) {
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
}, intervalMS);

chrome.storage.onChanged.addListener((changes, areaName) => {
	console.log('change storage : ' + JSON.stringify(changes) + ' ' + areaName)
});

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
		req.timeout = timeoutMS;
		req.open('GET', url, true);
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