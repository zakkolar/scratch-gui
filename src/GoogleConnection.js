import Google from './Google';

export default class GoogleConnection {

    constructor ({
        clientId,
        apiKey,
        scopes
    }){

        this.gapi = null;
        this.google = null;

        this.signedIn = false;
        this.signinStatusChangeHandlers = [];

        this.oauthToken = null;

        this.onLoadHandlers = [];

        this.loaded = false;

        this.pickerLoaded = false;

        if (!clientId){
            throw new Error('Missing Google client ID');
        }

        if (!apiKey){
            throw new Error('Missing Google API key');
        }

        this.clientId = clientId;
        this.apiKey = apiKey;
        this.scopes = scopes || [];

        const apiUrl = 'https://apis.google.com/js/api.js';
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = apiUrl;
        script.onload = () => this.handleClientLoad();
        document.body.append(script);

    }

    getGapi (){
        return this.gapi;
    }

    getGoogle (){
        return this.google;
    }

    loadPicker (cb = () => {}){
        if (!this.pickerLoaded){
            this.getGapi().load('picker', () => {
                this.pickerLoaded = true;
                this.google = window.google;
                cb();
            });
        }
    }

    showPicker (cb = () => {}){
        if (this.signedIn){
            if (this.pickerLoaded) {
                const view = new google.picker.DocsView;
                view.setMode(this.getGoogle().picker.DocsViewMode.LIST);
                // view.setMimeTypes('application/x.scratch.sb3');
                view.setQuery('.sb3');
                const picker = new google.picker.PickerBuilder()
                    .addView(view)
                    .setOAuthToken(this.getToken())
                    .setCallback(cb)
                    .build();
                picker.setVisible(true);
            } else {
                this.loadPicker(() => {
                    this.showPicker(cb);
                });
            }
        } else {
            throw new Error('Not signed into Google account');
        }

    }

    addSigninStatusChangeHandler (handler){
        this.signinStatusChangeHandlers.push(handler);
        this.updateSigninStatus(this.signedIn);
    }

    handleClientLoad (){
        this.gapi = window.gapi;
        this.loaded = true;
        this.loadPicker();
        this.getGapi().load('client:auth2', () => {
            this.initClient();
            this.handleOnLoadHandlers();
        });
    }

    addOnLoadHandler (handler){
        this.onLoadHandlers.push(handler);
        this.handleOnLoadHandlers();
    }

    handleOnLoadHandlers (){
        if (this.loaded){
            while (this.onLoadHandlers.length > 0){
                const handler = this.onLoadHandlers.pop();
                handler();
            }
        }
    }

    updateSigninStatus (signedIn){
        this.signedIn = signedIn;
        for (const handler of this.signinStatusChangeHandlers){
            handler(signedIn);
        }
    }

    getUser (){
        return this.getGapi().auth2.getAuthInstance().currentUser.get();
    }

    getUserName (){
        return this.getUser()
            .getBasicProfile()
            .getName();
    }

    getToken (){
        return this.getUser().getAuthResponse().access_token;
    }

    initClient (){
        const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

        this.getGapi().client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            discoveryDocs: DISCOVERY_DOCS,
            scope: this.scopes
        }).then(() => {
            this.getGapi().auth2.getAuthInstance().isSignedIn.listen(signedIn => {
                this.updateSigninStatus(signedIn);
            });

            this.updateSigninStatus(this.getGapi().auth2.getAuthInstance().isSignedIn.get());
        },
        error => {
            throw new Error(error);
        });
    }

    getPickedFileInfo (pickerData){
        if (pickerData.action === Google.getGoogle().picker.Action.PICKED) {
            const {
                id,
                name,
                mimeType
            } = pickerData.docs[0];

            return {
                id,
                name,
                mimeType
            };
        }

        return null;
    }

    getFileInfo (fileId) {
        return new Promise((resolve, reject) => {
            this.getGapi().client.drive.files.get({fileId}).then(response => {
                if (response.status === 200){
                    resolve(response.result);
                } else {
                    reject(response);
                }

            },
            e => {
                reject(e);
            });
        });
    }

    downloadFile (id){

        return new Promise((resolve, reject) => {
            const accessToken = this.getToken();
            const xhr = new XMLHttpRequest();
            // hard-coded URL because of issue described here:
            // https://support.google.com/chrome/thread/29767271?hl=en
            xhr.open('GET', `https://www.googleapis.com/drive/v2/files/${id}?alt=media&source=downloadUrl`);
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(xhr);
                }
            };
            xhr.onerror = e => {
                reject(e);
            };
            xhr.send();

        });
    }

}
