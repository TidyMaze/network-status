// Saves options to chrome.storage
function save_options() {
  var url = document.getElementById('url').value;
  var timeout = document.getElementById('timeout').value;
  var interval = document.getElementById('interval').value;
  var nbSamples = document.getElementById('nbSamples').value;
  chrome.storage.sync.set({
    url,
    timeout,
    interval,
    nbSamples
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    url: 'http://www.google.com',
    timeout: 4000,
    interval: 5000,
    nbSamples: 5
  }, function(items) {
    document.getElementById('url').value = items.url;
    document.getElementById('timeout').MaterialSlider.change(items.timeout);
    document.getElementById('interval').MaterialSlider.change(items.interval);
    document.getElementById('nbSamples').MaterialSlider.change(items.nbSamples);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})