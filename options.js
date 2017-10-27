document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

var optionsService = new OptionsService();

function save_options(){
  var options = {
    url : document.getElementById('url').value,
    timeout : document.getElementById('timeout').value,
    interval : document.getElementById('interval').value,
    nbSamples : document.getElementById('nbSamples').value,
  };
  optionsService.save_options(options, () => {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  })
}

function restore_options(){
  optionsService.restore_options(items => {
    console.log(items);
    document.getElementById('url').parentElement.MaterialTextfield.change(items.url);
    document.getElementById('timeout').MaterialSlider.change(items.timeout);
    document.getElementById('interval').MaterialSlider.change(items.interval);
    document.getElementById('nbSamples').MaterialSlider.change(items.nbSamples);
  });
}