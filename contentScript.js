var script = document.createElement("script");
script.src = chrome.extension.getURL("ergoSlackInjected.js");
document.body.appendChild(script);

// $ is not defined in contentScript.js, but it is in ergoSlackInjected.js
