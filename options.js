const DEFAULT_REDIRECTS = [
    { from: { hostname: "twitter.com" }, to: { hostname: "nitter.freedit.eu" } },
    { from: { hostname: "gist.github.com" }, to: { hostname: "gothub.dev.projectsegfau.lt", pathname: "gist{pathname}" } },
    { from: { hostname: "github.com" }, to: { hostname: "gothub.dev.projectsegfau.lt" } },
];


async function saveRedirect(e) {
    e.preventDefault();
    await browser.storage.sync.set({
        redirects: DEFAULT_REDIRECTS
    });
    restoreOptions();
}

async function restoreOptions() {
    const res = await browser.storage.sync.get('redirects');
    if (!("redirects" in res)) return;

    const select = document.querySelector("select");
    select.replaceChildren();
    const options = res.redirects.map(function({ from, to }) {
        const o = document.createElement("option");
        o.text = `${from.hostname} => ${to.hostname}`;
        return o;
    });
    select.append(...options);
}

function editRedirection({ from, to }) {
    const form = document.querySelector("form");
    form.reset();
    Object.keys(from).forEach(function(name) {
        form.querySelector(`#from-${name}`).value = from[name];
    });
    Object.keys(to).forEach(function(name) {
        form.querySelector(`#to-${name}`).value = to[name];
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveRedirect);
