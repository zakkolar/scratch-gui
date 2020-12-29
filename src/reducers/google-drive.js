const SIGN_IN_GOOGLE = 'scratch-gui/menus/googleDrive/SIGN_IN_GOOGLE';
const SIGN_OUT_GOOGLE = 'scratch-gui/menus/googleDrive/SIGN_OUT_GOOGLE';

const initialState = {
    signedIn: false,
    name: null
};

const reducer = function (state, action){
    if (typeof state === 'undefined') state = initialState;
    switch (action.type){
    case SIGN_IN_GOOGLE:
        return Object.assign({}, state, {
            signedIn: true,
            name: action.name
        });
    case SIGN_OUT_GOOGLE:
        return Object.assign({}, state, {
            signedIn: false,
            name: null
        });
    default:
        return state;
    }

};

const googleSignIn = name => ({
    type: SIGN_IN_GOOGLE,
    name
});

const googleSignOut = () => ({
    type: SIGN_OUT_GOOGLE
});

const googleDriveSignedIn = state => state.scratchGui.googleDrive.signedIn;
const googleDriveName = state => state.scratchGui.googleDrive.name;


export {
    reducer as default,
    initialState as googleDriveInitialState,
    SIGN_IN_GOOGLE,
    SIGN_OUT_GOOGLE,
    googleDriveSignedIn,
    googleDriveName,
    googleSignIn,
    googleSignOut
};
