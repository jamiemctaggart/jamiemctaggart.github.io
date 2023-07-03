// Midnight movie release date
var countDownDate = new Date("Jul 21, 2023 00:00:00").getTime();

function updateCountdown() {
    var now = new Date().getTime();

    var distance = countDownDate - now;

    var months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
    var days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (months > 0) {
        document.getElementById("months").innerHTML = months + " MONTHS";
    }
    if (days > 0) {
        document.getElementById("days").innerHTML = days + " DAYS";
    }
    if (hours > 0) {
        document.getElementById("hours").innerHTML = hours + " HOURS";
    }
    if (seconds > 0) {
        document.getElementById("seconds").innerHTML = seconds + " SECONDS";
    }

    // If the countdown is finished, say movie released
    if (distance < 0) {
        clearInterval(countdownfunction);
        document.getElementById("months").innerHTML = "MOVIE RELEASED!";
    }
}

updateCountdown();

var countdownfunction = setInterval(updateCountdown, 1000);
