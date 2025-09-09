document.addEventListener('DOMContentLoaded', function() {
    var demoModal = document.getElementById('demoModal');
    var demoIframe = document.getElementById('demoIframe');
    var demoModalLabel = document.getElementById('demoModalLabel');

    // This event fires just before the modal is about to be shown.
    demoModal.addEventListener('show.bs.modal', function(event) {
        var button = event.relatedTarget; // The link that was clicked
        var demoUrl = button.getAttribute('data-src');
        var demoName = button.textContent.trim();
        
        // Update the modal's title and set the iframe's src.
        demoModalLabel.textContent = demoName;
        demoIframe.src = demoUrl;
    });

    // This event fires when the modal is about to be hidden.
    demoModal.addEventListener('hide.bs.modal', function() {
        // Clear the iframe's src to stop the demo from running in the background.
        demoIframe.src = "";
        demoModalLabel.textContent = "";
    });
});