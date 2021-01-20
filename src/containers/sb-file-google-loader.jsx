import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {setProjectTitle} from '../reducers/project-title';

import log from '../lib/log';
import sharedMessages from '../lib/shared-messages';

import {
    LoadingStates,
    getIsLoadingUpload,
    getIsShowingWithoutId,
    onLoadedProject,
    requestProjectUpload, setProjectId
} from '../reducers/project-state';

import {
    openLoadingProject,
    closeLoadingProject
} from '../reducers/modals';
import {
    closeFileMenu
} from '../reducers/menus';

import Google from '../Google';

/**
 * SBFileUploader component passes a file input, load handler and props to its child.
 * It expects this child to be a function with the signature
 *     function (renderFileInput, handleLoadProject) {}
 * The component can then be used to attach project loading functionality
 * to any other component:
 *
 * <SBFileUploader>{(className, renderFileInput, handleLoadProject) => (
 *     <MyCoolComponent
 *         className={className}
 *         onClick={handleLoadProject}
 *     >
 *         {renderFileInput()}
 *     </MyCoolComponent>
 * )}</SBFileUploader>
 */


export const googleDriveLoaderMessages = defineMessages({
    loadFromGoogleTitle: {
        id: 'gui.googleLoader.loadFromGoogleTitle',
        defaultMessage: 'Load from Google Drive',
        description: 'Title for uploading a project from your Google Drive'
    }
});

class SBFileGoogleLoader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChooseFile',
            'handleClick'
        ]);
    }


    // called when user has finished selecting a file to upload
    handleChooseFile (data) {
        const file = Google.getPickedFileInfo(data);
        this.props.setProjectId(file.id);
        this.props.closeFileMenu();

    }

    handleClick () {
        Google.showPicker(this.handleChooseFile);
    }

    render () {
        return this.props.children(this.props.className, this.handleClick);
    }
}

SBFileGoogleLoader.propTypes = {
    canSave: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    children: PropTypes.func,
    className: PropTypes.string,
    closeFileMenu: PropTypes.func,
    vm: PropTypes.shape({
        loadProject: PropTypes.func
    }),
    setProjectId: PropTypes.func
};
SBFileGoogleLoader.defaultProps = {
    className: ''
};
const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        isLoadingUpload: getIsLoadingUpload(loadingState),
        isShowingWithoutId: getIsShowingWithoutId(loadingState),
        loadingState: loadingState,
        projectChanged: state.scratchGui.projectChanged,
        vm: state.scratchGui.vm
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    closeFileMenu: () => dispatch(closeFileMenu()),
    onLoadingFinished: (loadingState, success) => {
        dispatch(onLoadedProject(loadingState, ownProps.canSave, success));
        dispatch(closeLoadingProject());
        dispatch(closeFileMenu());
    },
    requestProjectUpload: loadingState => dispatch(requestProjectUpload(loadingState)),
    onLoadingStarted: () => dispatch(openLoadingProject()),
    onReceivedProjectTitle: title => dispatch(setProjectTitle(title)),
    setProjectId: projectId => {
        dispatch(setProjectId(projectId));
    }
});

// Allow incoming props to override redux-provided props. Used to mock in tests.
const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
    {}, stateProps, dispatchProps, ownProps
);

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(injectIntl(SBFileGoogleLoader));
