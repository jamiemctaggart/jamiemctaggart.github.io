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
fullListRisk = [2,1,1,1,1,2,3,3,3,1,1,3,3,1,2,2,1,2,1,1,1,2,1,1,3,1,1,3,1,1,3]// 3 is highest risk 1 is lowest
fullListConquerVal = [1,2,2,2,3,1,1,1,1,1,3,1,1,1,1,1,1,3,2,4,1,1,3,1,1,2,3,1,2,4,1] // 4 is super priority 1 is lowest
var shownListItems = [];
var probeHistory = [];
//var regionSort = false;
var sortType = 0; // default
refreshSystems(true);

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

function refresh(){
    target.innerHTML = "";
    subjugatedTarget.innerHTML = '<dt><h3 style="margin:auto; text-align:center;">Subjugated Systems</h3></dt>';
    if (sortType == 1) {
        sortedRefresh(false);//If here region sort is enabled
        sort.innerText = "Alphabet Sort"
    } else if (sortType == 0) {
        alphabetRefresh();// Not full refresh
        sort.innerText = "Region Sort"
    } else if (sortType == 2) {
        // conquer sort type
        conquerRefresh();
    } else if (sortType == 3) {
        riskRefresh();
    }
    subjugatedRefresh();
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
        target.innerHTML += '<dt><h3 width="100%">Conquer Values: ' + conquerVal + '</h3></dt>';
        for (var i = 0; i < fullList.length; i++) {
            if (fullListConquerVal[i] == conquerVal && shownListItems[i] == 0)
                addSystem(i);
        }
    }
}

function riskRefresh() {
    for (var riskVal = 3; riskVal > 0; riskVal--) {
        target.innerHTML += '<dt><h3 width="100%">Risk Values: ' + riskVal + '</h3></dt>';
        for (var i = 0; i < fullList.length; i++) {
            if (fullListRisk[i] == riskVal && shownListItems[i] == 0)
                addSystem(i);
        }
    }
}

function ConquerSort() {
    changeSort(2);

}

function RiskSort() {
    changeSort(3)

}

function addSystem(i, subjugated = false) {
    if (subjugated)
        subjugatedTarget.innerHTML += '<dt id="' + i + '"><p class="float-left">' + fullList[i] + '</p><button class="button float-right" onclick="removeSystem(' + i + ')">Probe</button><button class="button float-right" onclick="toggleSubjugate(' + i + ')">Unsubjugate</button></dt>';
    else
        target.innerHTML += '<dt id="' + i + '"><p class="float-left">' + fullList[i] + '</p><button class="button float-right" onclick="removeSystem(' + i + ')">Probe</button><button class="button float-right" onclick="toggleSubjugate(' + i + ')">Subjugate</button></dt>';
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
    refresh();
}

function toggleSubjugate(systemI) {
    if (shownListItems[systemI] == 0)
        shownListItems[systemI] = 1;
    else
        shownListItems[systemI] = 0;
    refresh();
}