function removeEmptyEntries(obj) {
    return Object.fromEntries(Object.entries(obj).filter(e => e[1]));
}

function getRedirect() {
    const form = document.querySelector("form");
    const getFrom = (id_part) => form.querySelector(`input#from-${id_part}`).value;
    const getTo = (id_part) => form.querySelector(`input#to-${id_part}`).value;

    const from = {
        hostname: getFrom("hostname"),
        pathname: getFrom("pathname")
    };
    const to = {
        hostname: getTo("hostname"),
        pathname: getTo("pathname")
    };
    return {
        from: removeEmptyEntries(from),
        to: removeEmptyEntries(to)
    };
}

async function restoreOptions() {
    const res = await browser.storage.sync.get('redirects');
    if (!res.hasOwnProperty("redirects")) return;

    const select = document.querySelector("select");
    select.replaceChildren();
    const options = res.redirects.map(function({ from, to }) {
        const o = document.createElement("option");
        o.text = `${from.hostname} => ${to.hostname}`;
        return o;
    });
    select.append(...options);
}

async function saveRedirect() {
    const res = await browser.storage.sync.get('redirects');
    const redirects = res.redirects || [];
    redirects.unshift(getRedirect());
    document.querySelector("form").reset();
    await browser.storage.sync.set({ redirects });
    restoreOptions();
}

async function overwriteSelected() {
    const selectedIndex = document.querySelector("select").selectedIndex;
    const res = await browser.storage.sync.get('redirects');
    if (!res.hasOwnProperty("redirects")) {
        console.error("No redirects found", res);
        return;
    }
    const redirects = res.redirects;
    if (selectedIndex >= redirects.length) {
        console.error("Bad index", selectedIndex);
        return;
    }
    redirects[selectedIndex] = getRedirect();
    document.querySelector("form").reset();
    await browser.storage.sync.set({ redirects });
    restoreOptions();
}


async function deleteSelected() {
    const select = document.querySelector("select");
    const indicesToDelete = Object.values(select.selectedOptions).map(o => o.index);
    const maxIndex = indicesToDelete.reduce((a, n) => n > a ? n : a, -1);

    const res = await browser.storage.sync.get('redirects');
    if (!res.hasOwnProperty("redirects")) return;

    const redirects = res.redirects;
    if (maxIndex >= redirects.length) {
        console.error("Bad indices");
        return;
    }
    await browser.storage.sync.set({
        redirects: redirects.filter((_, i) => !indicesToDelete.includes(i))
    });
    restoreOptions();
}

async function loadSelected() {
    const select = document.querySelector("select");
    const loadIndex = select.selectedIndex;

    const res = await browser.storage.sync.get('redirects');
    if (!res.hasOwnProperty("redirects")) {
        console.error("No redirects found", res);
        return;
    }

    const redirects = res.redirects;
    if (loadIndex >= redirects.length) {
        console.error("Bad index", loadIndex);
        return;
    }
    const { from, to } = redirects[loadIndex];
    const form = document.querySelector("form");
    form.reset();

    Object.keys(from).forEach(function(name) {
        form.querySelector(`#from-${name}`).value = from[name];
    });
    Object.keys(to).forEach(function(name) {
        form.querySelector(`#to-${name}`).value = to[name];
    });

    document.querySelector("details").setAttribute("open", "");
}

document.addEventListener('DOMContentLoaded', function() {
    restoreOptions();
    const saveButton = document.querySelector("button#save");
    const overwriteButton = document.querySelector("button#overwrite");
    const loadButton = document.querySelector("button#load")
    const deleteButton = document.querySelector("button#delete")

    const select = document.querySelector("select");

    saveButton.addEventListener("click", saveRedirect);
    overwriteButton.addEventListener("click", overwriteSelected);
    loadButton.addEventListener("click", loadSelected);
    deleteButton.addEventListener("click", deleteSelected);
});
