function sendEmail() {
    var email = 'chunziker@student.ethz.ch';
    var subject = 'Side-Eye';

    // E-Mail-Link generieren
    var mailtoLink = 'mailto:' + email + '?subject=' + encodeURIComponent(subject);

    // E-Mail-Link folgen
    window.location.href = mailtoLink;
}