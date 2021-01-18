import React, { Component } from 'react';

export default class Clock extends Component {
  constructor(props){
    super(props);
    this.state = {currentCount: 10}
  }
  refresh() {
    this.props.refresh()
}
  timer() {
    this.setState({
      currentCount: this.state.currentCount - 1
    })
    if(this.state.currentCount === 0) { 
        this.refresh()
        this.setState({currentCount: 10})
    }
  }
  componentDidMount() {
    this.intervalId = setInterval(this.timer.bind(this), 1000);
  }
  componentWillUnmount(){
    clearInterval(this.intervalId);
  }
  render() {
    return(
      <div>{this.state.currentCount}</div>
    );
  }
}