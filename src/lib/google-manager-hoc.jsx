import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import {compose} from 'redux';

import VM from 'scratch-vm';
import CloudProvider from '../lib/cloud-provider';

import {
    getIsShowingWithId
} from '../reducers/project-state';

import {
    showAlertWithTimeout
} from '../reducers/alerts';
import Google from "../Google";
import {googleDriveSignedIn, googleSignIn, googleSignOut} from '../reducers/google-drive';
import GoogleLoginButton from '../components/menu-bar/google-login-button.jsx';
import {injectIntl, intlShape} from "react-intl";

/*
 * Higher Order Component to manage the connection to the cloud server.
 * @param {React.Component} WrappedComponent component to manage VM events for
 * @returns {React.Component} connected component with vm events bound to redux
 */
const googleManagerHOC = function (WrappedComponent) {
    class GoogleManager extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                // 'handleCloudDataUpdate'
            ]);

            this.state = {
                googleLoaded: false
            };


        }
        componentDidMount () {
            Google.addSigninStatusChangeHandler(status => this.handleGoogleLoginStatusChange(status));

            Google.addOnLoadHandler(() => {
                this.setState({
                    googleLoaded: true
                });
            });
        }
        componentDidUpdate (prevProps) {
            // TODO need to add cloud provider disconnection logic and cloud data clearing logic
            // when loading a new project e.g. via file upload
            // (and eventually move it out of the vm.clear function)

            // if (this.shouldConnect(this.props) && !this.shouldConnect(prevProps)) {
            //     this.connectToCloud();
            // }
            //
            // if (this.shouldDisconnect(this.props, prevProps)) {
            //     this.disconnectFromCloud();
            // }
        }
        componentWillUnmount () {
            // this.disconnectFromCloud();
        }

        handleGoogleLoginStatusChange (signedIn){
            let name = null;
            if (signedIn){
                name = Google.getUserName();
                this.props.onRequestGoogleSignIn(name);
            } else {
                this.props.onRequestGoogleSignOut();
            }
        }

        render () {
            const {
                /* eslint-disable no-unused-vars */
                onRequestGoogleSignIn,
                onRequestGoogleSignOut,
                // eslint-disable-next-line no-shadow
                googleDriveSignedIn,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;

            if (this.props.googleDriveSignedIn) {
                return (
                    <WrappedComponent
                        {...componentProps}
                    />
                );
            }

            return (

                this.state.googleLoaded ? (
                    <React.Fragment>
                        <h1>{this.props.intl.formatMessage({
                            defaultMessage: 'Welcome! Please sign in below.',
                            description: 'Welcome message for Google login page',
                            id: 'gui.menuBar.googleWelcome'
                        })}</h1>

                        <GoogleLoginButton
                            buttonText={this.props.intl.formatMessage({
                                defaultMessage: 'Sign in with Google',
                                description: 'Button for user to grant access to their Google account',
                                id: 'gui.menuBar.signInWithGoogleButton'
                            })}
                        />
                    </React.Fragment>

                ) : (<h1>{this.props.intl.formatMessage({
                    defaultMessage: 'Loading...',
                    description: 'Loading message for Google login page',
                    id: 'gui.menuBar.googleLoading'
                })}</h1>));

        }
    }

    GoogleManager.propTypes = {
        onRequestGoogleSignIn: PropTypes.func,
        onRequestGoogleSignOut: PropTypes.func,
        googleDriveSignedIn: PropTypes.bool,
        intl: intlShape
    };

    GoogleManager.defaultProps = {
        onRequestGoogleSignIn: () => {},
        onRequestGoogleSignOut: () => {},
        googleDriveSignedIn: false
    };

    const mapStateToProps = state => ({
        googleDriveSignedIn: googleDriveSignedIn(state)
    });

    const mapDispatchToProps = dispatch => ({
        onRequestGoogleSignIn: name => dispatch(googleSignIn(name)),
        onRequestGoogleSignOut: () => dispatch(googleSignOut())
    });

    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );

    return compose(
        injectIntl,
        connect(
            mapStateToProps,
            mapDispatchToProps,
            mergeProps
        ))(GoogleManager);


};

export default googleManagerHOC;
