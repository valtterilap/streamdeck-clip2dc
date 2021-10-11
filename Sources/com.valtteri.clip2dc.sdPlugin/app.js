$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    // Subscribe to the willAppear and other events
    $SD.on('com.valtteri.clip2dc.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.valtteri.clip2dc.action.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('com.valtteri.clip2dc.action.propertyInspectorDidDisappear', (jsonObj) => {
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
            setTimeout(function(){$SD.api.openUrl(jsn.content, "https://clips.twitch.tv/" + this.clipURL + "/edit");}, 3000);
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
        response = await fetch("https://discordapp.com/api/webhooks/895682977768538152/CZU1qkATOUk3kFjE1Bue5DxSu80pXrN5bkmJLT2WGNLoGluQDJcvM10FgfkRvNlk9SLp", {
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

