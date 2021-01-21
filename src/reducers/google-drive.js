const SIGN_IN_GOOGLE = 'scratch-gui/menus/googleDrive/SIGN_IN_GOOGLE';
const SIGN_OUT_GOOGLE = 'scratch-gui/menus/googleDrive/SIGN_OUT_GOOGLE';
const LOAD_PROJECT_GOOGLE = 'scratch-gui/menus/googleDrive/LOAD_PROJECT_GOOGLE';

const initialState = {
    signedIn: false,
    ownsProject: false,
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
            name: null,
            ownsProject: false
        });
    case LOAD_PROJECT_GOOGLE:
        return Object.assign({}, state, {
            ownsProject: action.ownsProject
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

const googleLoadProject = ownsProject => ({
    type: LOAD_PROJECT_GOOGLE,
    ownsProject
});

const googleDriveSignedIn = state => state.scratchGui.googleDrive.signedIn;
const googleDriveName = state => state.scratchGui.googleDrive.name;
const googleDriveOwnsProject = state => state.scratchGui.googleDrive.ownsProject;


export {
    reducer as default,
    initialState as googleDriveInitialState,
    SIGN_IN_GOOGLE,
    SIGN_OUT_GOOGLE,
    googleDriveSignedIn,
    googleDriveName,
    googleDriveOwnsProject,
    googleSignIn,
    googleSignOut,
    googleLoadProject
};
