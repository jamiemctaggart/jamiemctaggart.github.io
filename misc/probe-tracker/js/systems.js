// Finds the target to add list items
var target = document.getElementById("SystemList");
var subjugatedTarget = document.getElementById("SubjugatedSystemList");
const sort = document.getElementById('sortText');
// Generates the full list of systems as a list of strings
const fullList = ["Alderaan", "Bespin", "Bothawui", "Cato Neimoidia", "Corellia",
 "Dagobah", "Dantooine", "Dathomir", "Endor", "Feluica", "Geonosis", "Hoth",
  "Ilum", "Kashyyk", "Kessel", "Malastare", "Mandalore", "Mon Calamari", "Mustafar",
   "Mygeeto", "Naboo", "Nal Hutta", "Ord Mantell", "Rodia", "Ryloth", "Saleucami",
    "Sullust", "Tatooine", "Toydaria", "Utapau", "Yavin"];
const fullListRegions = [7,8,2,7,7,
5,6,4,8,1,3,8,
6,4,2,4,4,1,8,
6,5,2,6,3,3,1,
5,3,2,5,1]
fullListRisk = [2,1,1,1,1,2,3,3,3,1,1,3,3,1,2,2,1,2,1,1,1,2,1,2,3,1,1,3,1,1,3]// 3 is highest risk 1 is lowest
fullListConquerVal = [1,2,2,2,3,1,1,1,1,1,3,1,1,1,1,1,1,3,2,4,1,1,3,1,1,2,3,1,2,4,1] // 4 is super priority 1 is lowest
//var shownListItems = [];

// Read the cookie when the page is first opened
const cookieValue = document.cookie
  .split('; ')
  .find(row => row.startsWith('shownListItems='))
  ?.split('=')[1];

var shownListItems = cookieValue ? JSON.parse(cookieValue) : /* default value */ [];


var probeHistory = [];
//var regionSort = false;
var sortType = 0; // default
// if length is 0 then it is the first time the page has been opened so set all to 0 (not probed) with full refresh
refreshSystems(shownListItems.length == 0);

const allZeros = shownListItems.every((val, i, arr) => val === 0);
if (shownListItems.length != 0 && !allZeros) {
    showNotification();
}

function searchFunction() {
    // Get input element
    let input = document.getElementById('searchInput');
    // Convert input to uppercase for case-insensitive searching
    let filter = input.value.toUpperCase();

    // Get system list elements
    let systemList = document.getElementById('SystemList');
    let subjugatedSystemList = document.getElementById('SubjugatedSystemList');

    // Combine both lists into an array
    let lists = [systemList, subjugatedSystemList];

    // Loop through both lists
    for (let list of lists) {
        // Get all systems in the list
        let systems = list.getElementsByTagName('dt');

        // Loop through all system items, and hide those who don't match the search query
        for (let i = 0; i < systems.length; i++) {
            let txtValue = systems[i].textContent || systems[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                systems[i].style.display = "";
            } else {
                systems[i].style.display = "none";
            }
        }
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchFunction(); // Call search function to reset the results after clearing the input
    refresh();
}

function showNotification() {
    const notification = document.getElementById("notification");
    notification.style.display = "block";
    notification.innerHTML = "Loaded saved list. <span class='closebtn' onclick='closeNotification()'>x</span>";
}

function closeNotification() {
    const notification = document.getElementById("notification");
    notification.style.display = "none";
}

function changeSort(newType) {
    //regionSort = !regionSort;//Swap sorting system
    // If sets to 1 and already 1 change to 0 instead
    if (sortType == newType) {
        sortType = 0;
    }
    else {
        sortType = newType;
    }
    refresh();
}

function saveCookie() {
    // Convert the integer array to a JSON string
    const shownListItemsString = JSON.stringify(shownListItems);

    // Write the shownListItemsString to a cookie
    document.cookie = `shownListItems=${shownListItemsString}`;
}

function deleteCookie() {
    document.cookie = "shownListItems=; expires=Thu, 01 Jan 1970 00:00:00 UTC"; 
}

function refresh(){
    target.innerHTML = "";
    subjugatedTarget.innerHTML = "";
    document.getElementById('searchInput').value = '';
    //subjugatedTarget.innerHTML = '<dt><h3 style="margin:auto; text-align:center;">Subjugated Systems</h3></dt>';
    if (sortType == 0) {
        alphabetRefresh();// Not full refresh
        sort.innerText = "Alphabet Sort"
    } else if (sortType == 1) {
        sortedRefresh(false);//If here region sort is enabled
        sort.innerText = "Region Sort"
    } else if (sortType == 2) {
        // conquer sort type
        conquerRefresh();
        sort.innerText = "Conquer Sort"
    } else if (sortType == 3) {
        riskRefresh();
        sort.innerText = "Risk Sort"
    }
    highlightActiveSort(sortType);
    subjugatedRefresh();
}

function highlightActiveSort(sortType) {
    var sortButtons = document.getElementsByClassName("sortButton");
    for (var i = 0; i < sortButtons.length; i++) {
        sortButtons[i].classList.remove("active");
    }
    sortButtons[sortType].classList.add("active");
}

function alphabetRefresh(){
    for (var i = 0; i < fullList.length; i++)
        if (shownListItems[i] == 0)// If not probed
            addSystem(i);
}

function subjugatedRefresh() {
    target.innerHTML += '';
    for (var i = 0; i < fullList.length; i++)
        if (shownListItems[i] == 1)// If not probed
            addSystem(i, true);
}

function sortedRefresh(fullRefresh = true) {
    if (fullRefresh)
        fullRefreshList();
    for (var region = 1; region <= 8; region++) {
        var notProbed = 0;
        for (var i = 0; i < fullList.length; i++)
            if (fullListRegions[i] == region)
                if (shownListItems[i] == 0) notProbed++;
        if (notProbed == 0) continue;
        target.innerHTML += '<dt id="imgBox"><img src="Images/region' + region + '.png" width="100%"/></dt>';
        for (var i = 0; i < fullList.length; i++)
            if (fullListRegions[i] == region && shownListItems[i] == 0)
                addSystem(i);
    }
}

function conquerRefresh() {
    for (var conquerVal = 4; conquerVal > 0; conquerVal--) {
        toAdd = [] //Start with an empty array of systems to add for the category
        for (var i = 0; i < fullList.length; i++) // Add to list if the correct conquer value and currently shown
            if (fullListConquerVal[i] == conquerVal && shownListItems[i] == 0)
                toAdd.push(i)
        if (toAdd.length != 0) {
            target.innerHTML += '<dt style="padding-bottom: 1rem;"><h3 style="margin:auto; text-align:center;">Conquer Value ' + conquerVal + ' (' + toAdd.length + ')</h3></dt>';
            for (var c = 0; c < toAdd.length; c++)
                addSystem(toAdd[c]);
        }
    }
}

function riskRefresh() {
    for (var riskVal = 3; riskVal > 0; riskVal--) {
        toAdd = [] //Start with an empty array of systems to add for the category
        for (var i = 0; i < fullList.length; i++) // Add to list if the correct risk value and currently shown
            if (fullListRisk[i] == riskVal && shownListItems[i] == 0)
                toAdd.push(i)
        if (toAdd.length != 0) {
            target.innerHTML += '<dt style="padding-bottom: 1rem;"><h3 style="margin:auto; text-align:center;">Risk Value ' + riskVal + ' (' + toAdd.length + ')</h3></dt>';
            for (var c = 0; c < toAdd.length; c++)
                addSystem(toAdd[c]);
        }
    }
}

function addSystem(i, subjugated = false) {
    // First check if additional style is required
    style = '';
    if (fullListRisk[i] == 3)
        style = 'style="color:red;"';
    else if (fullListRisk[i] == 2)
        style = 'style="color:yellow;"';
    
    // Now add the planet to either the subjugated list or the regular list
    if (subjugated)
        subjugatedTarget.innerHTML += '<dt id="' + i + '"><p ' + style + ' class="float-left">' + fullList[i] + '</p><button class="button float-right" onclick="removeSystem(' + i + ')">Probe</button><button class="button float-right" onclick="toggleSubjugate(' + i + ')">Unsubjugate</button></dt>';
    else
        target.innerHTML += '<dt id="' + i + '"><p ' + style + ' class="float-left">' + fullList[i] + '</p><button class="button float-right" onclick="removeSystem(' + i + ')">Probe</button><button class="button float-right" onclick="toggleSubjugate(' + i + ')">Subjugate</button></dt>';
}

function fullRefreshList() {
    shownListItems = [];
    closeNotification();
    probeHistory = [];
    for (var i = 0; i < fullList.length; i++)
        shownListItems.push(0);
    saveCookie();
}


function refreshSystems(fullRefresh = true) {
    if (fullRefresh) 
        fullRefreshList();
    refresh();
}

function undo() {
    if (probeHistory.length == 0) return;
    var i = probeHistory[probeHistory.length - 1];
    probeHistory.pop();
    shownListItems[i] = 0;
    refresh();
}

function removeSystem(systemI) {
    shownListItems[systemI] = 2;//Sets this to 2 to stop it from being displayed
    probeHistory.push(systemI);//Adds the removed systems to history.
    saveCookie();
    refresh();
}

function toggleSubjugate(systemI) {
    if (shownListItems[systemI] == 0)
        shownListItems[systemI] = 1;
    else
        shownListItems[systemI] = 0;
    saveCookie();
    refresh();
}

window.onload = function() {
    var acceptButton = document.getElementById('cookie-accept');
    var declineButton = document.getElementById('cookie-decline');
    var cookieBanner = document.getElementById('cookie-banner');

    // Check if user has already made a choice
    if (!getCookie('cookie_consent')) {
        cookieBanner.style.display = 'block'; // Show banner if no choice made
    }

    acceptButton.onclick = function() {
        setCookie('cookie_consent', 'accepted', 365);
        cookieBanner.style.display = 'none';
        // Insert your analytics script here if the user has accepted cookies
    }

    declineButton.onclick = function() {
        setCookie('cookie_consent', 'declined', 365);
        cookieBanner.style.display = 'none';
        // Do not insert analytics script if the user has declined cookies
    }
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
