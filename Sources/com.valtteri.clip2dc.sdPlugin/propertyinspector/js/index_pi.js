$SD.on('connected', (jsn) => {
    console.log("connected");
    console.log(jsn);
    if(jsn.hasOwnProperty("actionInfo")) {
        let settings = Utils.getProp(jsn, "actionInfo.payload.settings", {});
        document.getElementById("channelName").value = settings.channelName || ""
        document.getElementById("twitchToken").value = settings.twitchToken || ""
        document.getElementById("dcWebhook").value = settings.dcWebhook || ""
    }
});

const save = function() {
    if($SD) {
        var payload = {};
        [].forEach.call(document.querySelectorAll(".inspector"), element => {
            payload[element.id] = element.value;
        });
        $SD.api.sendToPlugin($SD.uuid, $SD.actionInfo["action"], payload);
    }
}