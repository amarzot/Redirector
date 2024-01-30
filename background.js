const REDIRECTS = [
    { from: { hostname: "twitter.com" }, to: { hostname: "nitter.freedit.eu" } },
    { from: { hostname: "gist.github.com" }, to: { hostname: "gothub.dev.projectsegfau.lt", pathname: "gist{pathname}" } },
];


function format(s, args) {
    for (const argName in args) {
        s = s.replace(`{${argName}}`, args[argName])
    }
    return s;
}


function urlMatches(url, rules) {
    return Object.entries(rules).map((entry) =>
        url[entry[0]] === entry[1]
    ).every(bool => bool === true);
}

function convertUrl(url, parts) {
    for (const part in parts) {
        url[part] = format(parts[part], url);
    }
    return url
}


async function logURL(request) {
    let url = new URL(request.url);
    console.log({ url });

    for (const { from, to } of REDIRECTS) {
        console.log({ from, to })
        const matches = urlMatches(url, from);
        console.log({ matches });

        if (matches) {
            return {
                redirectUrl: convertUrl(url, to).toString(),
            }
        }
    }
}

browser.webRequest.onBeforeRequest.addListener(
    logURL,
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);
