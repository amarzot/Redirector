const DEFAULT_REDIRECTS = [
    { from: { hostname: "twitter.com" }, to: { hostname: "nitter.freedit.eu" } },
    { from: { hostname: "gist.github.com" }, to: { hostname: "gothub.dev.projectsegfau.lt", pathname: "gist{pathname}" } },
    { from: { hostname: "github.com" }, to: { hostname: "gothub.dev.projectsegfau.lt" } },
];

function format(fstring, args) {
    return Object.keys(args).reduce(
        (s, argName) => s.replace(`{${argName}}`, args[argName]),
        fstring
    );
}


function urlMatches(url, rules) {
    return Object.entries(rules).map((entry) =>
        url[entry[0]] === entry[1]
    ).every(bool => bool === true);
}

function convertUrl(url, parts) {
    Object.keys(parts).forEach((part) => url[part] = format(parts[part], url));
    return url;
}


async function handleRequest(request) {
    let url = new URL(request.url);
    const res = await browser.storage.sync.get('redirects');
    if (!res.hasOwnProperty("redirects")) return;

    const redirection = res.redirects.find(({ from }) => urlMatches(url, from));
    if (redirection === undefined) return;

    return {
        redirectUrl: convertUrl(url, redirection.to).toString(),
    };
}


browser.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        browser.storage.sync.set({ redirects: DEFAULT_REDIRECTS });
    }
});

browser.webRequest.onBeforeRequest.addListener(
    handleRequest,
    { types: ["main_frame"], urls: ["<all_urls>"] },
    ["blocking"]
);
