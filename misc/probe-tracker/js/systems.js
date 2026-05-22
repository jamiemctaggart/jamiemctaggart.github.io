var target = document.getElementById("SystemList");
var subjugatedTarget = document.getElementById("SubjugatedSystemList");

const fullList = [
    "Alderaan", "Bespin", "Bothawui", "Cato Neimoidia", "Corellia",
    "Dagobah", "Dantooine", "Dathomir", "Endor", "Felucia", "Geonosis", "Hoth",
    "Ilum", "Kashyyk", "Kessel", "Malastare", "Mandalore", "Mon Calamari", "Mustafar",
    "Mygeeto", "Naboo", "Nal Hutta", "Ord Mantell", "Rodia", "Ryloth", "Saleucami",
    "Sullust", "Tatooine", "Toydaria", "Utapau", "Yavin"
];
const fullListRegions =    [7,8,2,7,7, 5,6,4,8,1,3,8, 6,4,2,4,4,1,8, 6,5,2,6,3,3,1, 5,3,2,5,1];
const fullListRisk =       [2,1,1,1,1, 2,3,3,3,1,1,3, 3,1,2,2,1,2,1, 1,1,2,1,2,3,1, 1,3,1,1,3];
const fullListConquerVal =  [1,2,2,2,3, 1,1,1,1,1,3,1, 1,1,1,1,1,3,2, 4,1,1,3,1,1,2, 3,1,2,4,1];

const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('shownListItems='))
    ?.split('=')[1];

var shownListItems = cookieValue ? JSON.parse(cookieValue) : [];
var probeHistory = [];
var sortType = 0;

refreshSystems(shownListItems.length === 0);

const allZeros = shownListItems.every(val => val === 0);
if (shownListItems.length !== 0 && !allZeros) {
    showNotification();
}

function searchFunction() {
    const filter = document.getElementById('searchInput').value.toUpperCase();
    const lists = [
        document.getElementById('SystemList'),
        document.getElementById('SubjugatedSystemList')
    ];
    for (const list of lists) {
        const cards = list.getElementsByClassName('system-card');
        for (let i = 0; i < cards.length; i++) {
            const name = cards[i].querySelector('.system-name').textContent;
            cards[i].style.display = name.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
        }
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchFunction();
    refresh();
}

function showNotification() {
    const el = document.getElementById('notification');
    el.style.display = 'block';
    el.innerHTML = "Loaded saved list. <span class='closebtn' onclick='closeNotification()'>x</span>";
}

function closeNotification() {
    document.getElementById('notification').style.display = 'none';
}

function changeSort(newType) {
    sortType = (sortType === newType) ? 0 : newType;
    refresh();
}

function saveCookie() {
    document.cookie = `shownListItems=${JSON.stringify(shownListItems)}`;
}

function deleteCookie() {
    document.cookie = "shownListItems=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function refresh() {
    target.innerHTML = '';
    subjugatedTarget.innerHTML = '';
    document.getElementById('searchInput').value = '';

    if (sortType === 0) alphabetRefresh();
    else if (sortType === 1) sortedRefresh(false);
    else if (sortType === 2) conquerRefresh();
    else if (sortType === 3) riskRefresh();

    highlightActiveSort(sortType);
    subjugatedRefresh();
    updateStats();
}

function highlightActiveSort(type) {
    const buttons = document.getElementsByClassName('sortButton');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle('active', i === type);
    }
}

function updateStats() {
    const remaining   = shownListItems.filter(v => v === 0).length;
    const probed      = shownListItems.filter(v => v === 2).length;
    const subjugated  = shownListItems.filter(v => v === 1).length;
    const bar = document.getElementById('stats-bar');
    if (bar) {
        bar.innerHTML =
            `<span class="stat-item"><strong>${remaining}</strong> remaining</span>` +
            `<span class="stat-sep">|</span>` +
            `<span class="stat-item"><strong>${probed}</strong> probed</span>` +
            `<span class="stat-sep">|</span>` +
            `<span class="stat-item"><strong>${subjugated}</strong> subjugated</span>`;
    }
}

function alphabetRefresh() {
    for (let i = 0; i < fullList.length; i++)
        if (shownListItems[i] === 0) addSystem(i);
}

function subjugatedRefresh() {
    for (let i = 0; i < fullList.length; i++)
        if (shownListItems[i] === 1) addSystem(i, true);
}

function sortedRefresh(fullRefresh = true) {
    if (fullRefresh) fullRefreshList();
    for (let region = 1; region <= 8; region++) {
        const notProbed = fullList.filter((_, i) =>
            fullListRegions[i] === region && shownListItems[i] === 0
        ).length;
        if (notProbed === 0) continue;
        target.innerHTML += `<div class="region-header"><img src="Images/region${region}.png" width="100%"/></div>`;
        for (let i = 0; i < fullList.length; i++)
            if (fullListRegions[i] === region && shownListItems[i] === 0)
                addSystem(i);
    }
}

function conquerRefresh() {
    for (let cv = 4; cv > 0; cv--) {
        const toAdd = fullList
            .map((_, i) => i)
            .filter(i => fullListConquerVal[i] === cv && shownListItems[i] === 0);
        if (toAdd.length === 0) continue;
        target.innerHTML += `<div class="section-header"><h3>Conquer Value ${cv} <span class="count">(${toAdd.length})</span></h3></div>`;
        for (const i of toAdd) addSystem(i);
    }
}

function riskRefresh() {
    const labels = { 3: 'High Risk', 2: 'Medium Risk', 1: 'Low Risk' };
    for (let rv = 3; rv > 0; rv--) {
        const toAdd = fullList
            .map((_, i) => i)
            .filter(i => fullListRisk[i] === rv && shownListItems[i] === 0);
        if (toAdd.length === 0) continue;
        target.innerHTML += `<div class="section-header"><h3>${labels[rv]} <span class="count">(${toAdd.length})</span></h3></div>`;
        for (const i of toAdd) addSystem(i);
    }
}

function addSystem(i, subjugated = false) {
    const risk    = fullListRisk[i];
    const region  = fullListRegions[i];
    const cv      = fullListConquerVal[i];
    const riskClass = risk === 3 ? 'risk-high' : risk === 2 ? 'risk-med' : 'risk-low';
    const riskLabel = risk === 3 ? 'High' : risk === 2 ? 'Med' : 'Low';

    const card = `<div class="system-card" id="sys-${i}">
        <div class="system-info">
            <span class="system-name">${fullList[i]}</span>
            <div class="system-badges">
                <span class="badge badge-region">R${region}</span>
                <span class="badge badge-risk ${riskClass}">${riskLabel} Risk</span>
                <span class="badge badge-cv">CV ${cv}</span>
            </div>
        </div>
        <div class="system-actions">
            ${subjugated
                ? `<button class="btn-action btn-unsubjugate" onclick="toggleSubjugate(${i})">Unsubjugate</button>`
                : `<button class="btn-action btn-subjugate" onclick="toggleSubjugate(${i})">Subjugate</button>`
            }
            <button class="btn-action btn-probe" onclick="removeSystem(${i})">Probe</button>
        </div>
    </div>`;

    if (subjugated) subjugatedTarget.innerHTML += card;
    else target.innerHTML += card;
}

function fullRefreshList() {
    shownListItems = fullList.map(() => 0);
    closeNotification();
    probeHistory = [];
    saveCookie();
}

function refreshSystems(fullRefresh = true) {
    if (fullRefresh && shownListItems.some(v => v !== 0)) {
        if (!confirm('Reset all systems? This will clear all probes and subjugated systems.')) return;
    }
    if (fullRefresh) fullRefreshList();
    refresh();
}

function undo() {
    if (probeHistory.length === 0) return;
    const i = probeHistory.pop();
    shownListItems[i] = 0;
    saveCookie();
    refresh();
}

function removeSystem(systemI) {
    shownListItems[systemI] = 2;
    probeHistory.push(systemI);
    saveCookie();
    refresh();
}

function toggleSubjugate(systemI) {
    shownListItems[systemI] = shownListItems[systemI] === 0 ? 1 : 0;
    saveCookie();
    refresh();
}

window.onload = function() {
    const acceptButton  = document.getElementById('cookie-accept');
    const declineButton = document.getElementById('cookie-decline');
    const cookieBanner  = document.getElementById('cookie-banner');

    if (!getCookie('cookie_consent')) {
        cookieBanner.style.display = 'block';
    }

    acceptButton.onclick = function() {
        setCookie('cookie_consent', 'accepted', 365);
        cookieBanner.style.display = 'none';
    };

    declineButton.onclick = function() {
        setCookie('cookie_consent', 'declined', 365);
        cookieBanner.style.display = 'none';
    };
};

function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}
