document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("button").addEventListener("click", () => browser.runtime.openOptionsPage());
});
