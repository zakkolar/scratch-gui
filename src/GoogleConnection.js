export default class GoogleConnection {

    constructor ({
        clientId,
        apiKey,
        scopes
    }){

        this.gapi = null;

        this.signedIn = false;
        this.signinStatusChangeHandlers = [];

        this.onLoadHandlers = [];

        this.loaded = false;

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

    addSigninStatusChangeHandler (handler){
        this.signinStatusChangeHandlers.push(handler);
        this.updateSigninStatus(this.signedIn);
    }

    handleClientLoad (){
        this.gapi = window.gapi;
        this.loaded = true;
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
}
