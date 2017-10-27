class OptionsService {
  save_options(options, callback) {
    chrome.storage.sync.set(options, callback);
  }

  restore_options(callback) {
    chrome.storage.sync.get({
      url: 'http://www.google.com',
      timeout: 4000,
      interval: 5000,
      nbSamples: 5
    }, callback);
  }
}