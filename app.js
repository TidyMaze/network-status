var maxLengthHistory = 30;

var currentState = 'UNKNOWN';

window.onload = () => {
	var titleContainerEl = document.getElementById('titleContainer');
	var titleEl = document.getElementById('title');

	function setNetworkUp(){
		if(currentState != 'UP'){
			console.log('Network is UP!');
			titleContainerEl.style.color='white';
			titleContainerEl.style.backgroundColor='green';
			titleEl.innerHTML = 'Network is UP!';
			currentState = 'UP';
		}
	}

	function setNetworkDown(){
		if(currentState != 'DOWN'){
			console.log('Network is DOWN!');
			titleContainerEl.style.color='white';
			titleContainerEl.style.backgroundColor='red';
			titleEl.innerHTML = 'Network is DOWN!';
			currentState = 'DOWN';
		}
	}

	var ctx = document.getElementById('myChart').getContext('2d');
	var chart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        datasets: [
		        {
		            label: "UP",
		            backgroundColor: 'green',
		            borderColor: 'rgb(0, 100, 0)',
		            data: []
		        },
		        {
		            label: "DOWN",
		            backgroundColor: 'red',
		            borderColor: 'rgb(100, 0, 0)',
		            data: []
		        }
	        ]
	    },
	    options: {
	    	scales: {
	            yAxes: [{
	                stacked: true,
	                ticks: {
	                	min: 0,
	                	max: 100,
	                	callback: (value => value + '%')
	                }
	            }],
	            xAxes: [{
	            	type: 'time'
	            }]
        	}
	    }
	});

	var datasetUP = chart.data.datasets.find(e => e.label == 'UP');
	var datasetDOWN = chart.data.datasets.find(e => e.label == 'DOWN');

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		console.log('request : ' + JSON.stringify(request));
		sendResponse('ok');
		var upCount = request.history[request.history.length-1].upCount;
		var downCount = request.history[request.history.length-1].downCount;
		if(upCount > downCount){
			setNetworkUp();
		} else {
			setNetworkDown();
		}

		var latestUP = datasetUP.data.length > 0 ? datasetUP.data[datasetUP.data.length - 1].t : null;
		var latestDOWN = datasetDOWN.data.length > 0 ? datasetDOWN.data[datasetDOWN.data.length - 1].t : null;

		request.history.forEach(s => {
			// if(latestUP == null || s.time > latestUP){
			// 	datasetUP.data.push({
			// 		t: s.time,
			// 		y: s.upCount
			// 	});
			// }

			// if(latestDOWN == null || s.time > latestDOWN){
			// 	datasetDOWN.data.push({
			// 		t: s.time,
			// 		y: s.downCount
			// 	});
			// }

			if(latestUP == null || s.time > latestUP){
				datasetUP.data.push({
					t: s.time,
					y: (s.upCount / (s.upCount + s.downCount)) * 100
				});
			}

			if(latestDOWN == null || s.time > latestDOWN){
				datasetDOWN.data.push({
					t: s.time,
					y: (s.downCount / (s.upCount + s.downCount)) * 100
				});
			}


		});

		if(datasetUP.data.length > maxLengthHistory) datasetUP.data.splice(0, datasetUP.data.length-maxLengthHistory);
		if(datasetDOWN.data.length > maxLengthHistory) datasetDOWN.data.splice(0, datasetDOWN.data.length-maxLengthHistory);

		console.log('datasetUP.data : ' + JSON.stringify(datasetUP.data));
		console.log('datasetDOWN.data : ' + JSON.stringify(datasetDOWN.data));
		chart.update();
	});

	chrome.storage.onChanged.addListener((changes, areaName) => {
		console.log('change storage : ' + JSON.stringify(changes) + ' ' + areaName)
	})
}