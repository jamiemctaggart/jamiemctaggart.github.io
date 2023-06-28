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

function refresh(){
    target.innerHTML = "";
    subjugatedTarget.innerHTML = '<dt><h3 style="margin:auto; text-align:center;">Subjugated Systems</h3></dt>';
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
    probeHistory = [];
    for (var i = 0; i < fullList.length; i++)
        shownListItems.push(0);
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