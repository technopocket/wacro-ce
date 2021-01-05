



chrome.browserAction.onClicked.addListener(() => {
    console.log("start");
});



chrome.webRequest.onHeadersReceived.addListener(function(a) {
    for (var b = a.responseHeaders.length; --b;)
        if ("access-control-allow-origin" === a.responseHeaders[b].name.toLowerCase()) {
            a.responseHeaders[b].value = "*";
            break
        } 0 === b && a.responseHeaders.push({
        name: "Access-Control-Allow-Origin",
        value: "*"
    });
    return {
        responseHeaders: a.responseHeaders
    }
}, {
    urls: ["*://*.pximg.net/*"],
    types: ["xmlhttprequest"]
}, ["blocking", "responseHeaders", "extraHeaders"]);