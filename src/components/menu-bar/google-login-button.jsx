/*
React Google Authorize (https://github.com/mayple/react-google-authorize)

MIT License

Copyright (c) 2021 Zak Kolar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

MIT License

Copyright (c) 2018 Selectom

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

MIT License

Copyright (c) 2016 Anthony Grove

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import GoogleIcon from './google-icon.jsx';
import Google from '../../Google';


class GoogleLoginButton extends Component {
    constructor (props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            disabled: true
        };
    }

    componentDidMount () {
        Google.addOnLoadHandler(() => {
            this.setState({
                disabled: false
            });
        });
    }

    handleClick (e) {
        if (e) {
            e.preventDefault(); // to prevent submit if used within form
        }

        const {disabled} = this.state;
        if (disabled) {
            return;
        }

        Google.getGapi().auth2.getAuthInstance().signIn()
            .then(data => {
                if (this.props.onSuccess){
                    this.props.onSuccess(data);
                }

            },
            error => {
                if (this.props.onFailure){
                    this.props.onFailure(error);
                }

            });

    }

    render () {
        const {
            tag, type, style, className, disabledStyle, buttonText, children, render
        } = this.props;
        const disabled = this.state.disabled || this.props.disabled;
        if (render) {
            return render({onClick: this.handleClick});
        }
        const initialStyle = {
            display: 'inline-block',
            background: '#fff',
            color: 'rgba(0, 0, 0, .54)',
            // width: 220,
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: 12,
            paddingRight: 12,
            borderRadius: 2,
            border: '1px solid ',
            fontSize: 13,
            lineHeight: 1.8,
            fontFamily: 'Roboto, sans-serif',
            cursor: 'pointer',
            marginRight: 5
        };
        const styleProp = (() => {
            if (style) {
                return style;
            } else if (className && !style) {
                return {};
            }
            return initialStyle;
        })();
        const defaultStyle = (() => {
            if (disabled) {
                return Object.assign({}, styleProp, disabledStyle);
            }
            return styleProp;
        })();
        const googleLoginButton = React.createElement(
            tag,
            {
                onClick: this.handleClick,
                style: defaultStyle,
                type,
                disabled,
                className
            },
            [
                <GoogleIcon key={1} />,
                children || buttonText
            ]
        );
        return googleLoginButton;
    }
}

GoogleLoginButton.propTypes = {
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    buttonText: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    style: PropTypes.object,
    disabledStyle: PropTypes.object,
    tag: PropTypes.string,
    disabled: PropTypes.bool,
    type: PropTypes.string,
    render: PropTypes.func
};

GoogleLoginButton.defaultProps = {
    type: 'button',
    tag: 'button',
    buttonText: 'Login with Google',
    scope: 'profile email',
    prompt: '',
    cookiePolicy: 'single_host_origin',
    fetchBasicProfile: true,
    uxMode: 'popup',
    disabledStyle: {
        opacity: 0.6,
        background: '#9c9c9c',
        cursor: 'not-allowed'
    },
    onRequest: () => {}
};

export default GoogleLoginButton;
