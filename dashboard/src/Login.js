import './App.css';
import { Button, InputGroup, FormControl, Alert } from 'react-bootstrap';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username : "",
            password : "",
            register: false,
            isLoading: false,
            email: "",
            error: false,
            error_message: "",
        }
        this.handleChangeUsername = this.handleChangeUsername.bind(this);
        this.handleChangePass = this.handleChangePass.bind(this);
        this.handleChangeEmail = this.handleChangeEmail.bind(this);
        
    }

    handleSubmit = event => {
        event.preventDefault();
      }

      login = () => {
        axios.post("http://localhost:8080/login", {'email': this.state.email, 'password': this.state.password}, {
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            }})
        .then(data =>  {
            if (data.data.error === false) {
                localStorage.setItem("id", data.data.id)
                document.cookie = "id=" + data.data.id
                this.props.history.push('/dashboard')
                window.location.reload()
            } else {
                this.setState({
                    error: true, 
                    error_message: data.data.status
                })
            }
        })
    }

    register = () => {
        axios.post("http://localhost:8080/register", {'email': this.state.email, 'username': this.state.username, 'password': this.state.password }, {
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            }})
        .then(data =>  {
            if (data.data.error != true) {
                localStorage.setItem("id", data.data.id)
                document.cookie = "id=" + data.data.id
                this.props.history.push('/dashboard')
                window.location.reload()
            } else {
                this.setState({
                error: true, 
                error_message: data.data.status
                })
            }
        })
    }

    handleChangeUsername(event) {
        this.setState({ open: true })
        this.setState({ username: event.target.value });
    }

    handleChangeEmail(event) {
        this.setState({ open: true })
        this.setState({ email: event.target.value });
    }

    handleChangePass(event) {
        this.setState({ open: true })
        this.setState({ password: event.target.value });
    }

    componentDidMount() {
        if (document.cookie.indexOf("id=") != -1 ) {
            this.props.history.push('/dashboard')
        }
    }

    render() {
        return (
            <div style={{flex: 1, }}>
                {this.state.error === true ? <Alert  variant="danger" onClose={() => this.setState({error : false})} dismissible>
        <Alert.Heading style={{fontSize: 17}}>{this.state.error_message}</Alert.Heading>
                </Alert> : null}
                <body className='login' style={{textAlign: 'center', flex: 1, flexDirection:'column' }}>

                    <div className='login_group' >
                        <div className='login_solo'>
                            <h1>Dashboard</h1>
                        </div>
                        
                        {this.state.register === true ? <div className='login_solo'>
                            <InputGroup style={{}}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    value={this.state.username}
                                    onChange={this.handleChangeUsername}
                                    placeholder="Username"
                                    aria-label="Username"
                                    aria-describedby="basic-addon1"
                                    />
                            </InputGroup>
                        </div> : null}
                        <div className='login_solo'>
                            <InputGroup style={{}}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    value={this.state.email}
                                    onChange={this.handleChangeEmail}
                                    placeholder="Email"
                                    aria-label="Email"
                                    aria-describedby="basic-addon1"
                                    />
                                
                            </InputGroup>
                        </div>
                        <div className='login_solo'>
                            <InputGroup style={{}}>
                                <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon={faLock}/></InputGroup.Text>
                                </InputGroup.Prepend>
                                    <FormControl
                                        value={this.state.password}
                                        onChange={this.handleChangePass}
                                        placeholder="Password"
                                        aria-label="Password"
                                        aria-describedby="basic-addon1"
                                    />
                            </InputGroup>
                        </div>
                        <div className='login_solo'>
                            {this.state.register === false ? <Button variant="primary" onClick={() => {this.login()}} style={{margin: 10, marginRight: 20}}>Login</Button>:  null}
                           
                            {this.state.register === false ? <Button variant="primary" onClick={() => {this.setState({register: true})}} style={{margin: 10, marginLeft: 20}}>Register</Button>: null}
                            {this.state.register === false ? <Button variant="primary" style={{margin: 10, marginLeft: 20}} onClick={() => {axios.get("http://localhost:8080/twitter/login").then(data =>  {
                                            if (data.data.error === false) {
                                                console.log(data.data)
                                                window.location.href = data.data.url;
                                            }
                                            })}}
                                                >Connect Twitter</Button>: null}
                            {this.state.register === true ? <Button variant="primary" onClick={() => {this.setState({register: false})}} style={{margin: 10, marginLeft: 20}}>Back</Button>: null}
                            {this.state.register === true ? <Button variant="primary" onClick={() => {
                                this.register()
                                this.setState({register: false})
                                 }} style={{margin: 10, marginLeft: 20}}>Register</Button>: null}

                        </div>

                    </div>
                </body>
            </div>
        );
    }
}



export default Login;