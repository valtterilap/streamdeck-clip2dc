$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    // Subscribe to the willAppear and other events
    $SD.on('com.valtteri.clip2dc.action.clip.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.clip.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.clip.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.clip.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.clip.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('com.valtteri.clip2dc.action.clip.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
};

const action = {
    settings: {},
    brodcastId: "",
    clipURL: "",

    onWillAppear: function (jsn) {
        console.log(`[onWillAppear] ${JSON.stringify(jsn)}`)
    },

    onKeyUp: function (jsn) {
        console.log(`[onKeyUp] ${JSON.stringify(jsn)}`)
        if (!jsn.payload.settings || !jsn.payload.settings.channelName || !jsn.payload.settings.twitchToken || !jsn.payload.settings.dcWebhook) {
            $SD.api.showAlert(jsn.context);
            return;
        }
        this.clipToDc(jsn).then(result => {
            $SD.api.showOk(jsn.context)
            if(jsn.payload.settings.editClip){
                $SD.api.openUrl(jsn.content, this.clipURL + "/edit");
            }
        }).catch((error) => {
            console.log(error);
            $SD.api.showAlert(jsn.context);
            return;
        })
    },

    onSendToPlugin: function (jsn) {
        console.log(`[onSendToPlugin] ${JSON.stringify(jsn)}`)
        if (jsn.payload) {
            $SD.api.setSettings(jsn.context, jsn.payload)
        }
    },

    clipToDc: async function(jsn) {
        const brodcastIdResponse = await fetch("https://api.twitch.tv/helix/users?login=" + jsn.payload.settings.channelName, {
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + jsn.payload.settings.twitchToken,
                "Client-Id": "l0a7jchcfebrzsoz3mr2v9s72vmrdg",
                "content-type": "application/json"
            }
        });
        const brodcasterJson = await brodcastIdResponse.json();
        this.brodcastId = brodcasterJson.data[0].id;
        const fetchClipResponse = await fetch("https://api.twitch.tv/helix/clips?broadcaster_id=" + this.brodcastId, {
            "method": "POST",
            "headers": {
                "Authorization": "Bearer " + jsn.payload.settings.twitchToken,
                "Client-Id": "l0a7jchcfebrzsoz3mr2v9s72vmrdg",
                "content-type": "application/json"
            }
        })
        const clipJson = await fetchClipResponse.json();
        console.log(clipJson);
        this.clipURL = "https://clips.twitch.tv/" + clipJson.data[0].id
        response = await fetch(jsn.payload.settings.dcWebhook, {
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "Accept": "*/*"
            },
            "body": JSON.stringify({ content: this.clipURL })
        })
        return response;
    }
};

