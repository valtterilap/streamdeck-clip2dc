$SD.on('connected', (jsn) => {
    console.log("connected");
    console.log(jsn);
    if(jsn.hasOwnProperty("actionInfo")) {
        let settings = Utils.getProp(jsn, "actionInfo.payload.settings", {});
        Object.keys(settings).forEach(key => {
            try {
                document.getElementById(key).value = settings[key] || "";
            } catch (error) {
                console.error(error);
            }
        })
    }
    $SD.api.getGlobalSettings($SD.uuid);
});

$SD.on("didReceiveGlobalSettings", (jsn) => {
    let settings = Utils.getProp(jsn, "payload.settings", {});
    Object.keys(settings).forEach(key => {
        if (!document.getElementById(key).value) {
            document.getElementById(key).value = settings[key] || "";
        }
    })
})

const save = function() {
    if($SD) {
        var payload = {};
        [].forEach.call(document.querySelectorAll(".inspector"), element => {
            payload[element.id] = element.value;
        });
        payload["editClip"] = document.getElementById("rdio1").checked
        $SD.api.sendToPlugin($SD.uuid, $SD.actionInfo["action"], payload);
        var globalPayload = {};
        [].forEach.call(document.querySelectorAll(".globalsetting"), element => {
            globalPayload[element.id] = element.value;
        })
        $SD.api.setGlobalSettings($SD.uuid, globalPayload);
    }
}