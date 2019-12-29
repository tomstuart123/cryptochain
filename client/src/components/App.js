import React, { Component } from 'react';
// add a link back to home page in routers without a tags
import { Link } from 'react-router-dom';
import logo from '../assets/logo-cryptochain.png';

class App extends Component {
    // constructor() {
    //     super()
    state = {
            walletInfo: {}
    }
    // }
    componentDidMount() {
        // fetch uses a promise. Stores call as a promise object. Application runs even if the request takes time.
        fetch(`${document.location.origin}/api/wallet-info`)
        .then((response) => {
            response.json()
            .then((json) => {
                this.setState({
                    walletInfo: json
                })
            })
        })
    }


    
    render() {
        const { address, balance } = this.state.walletInfo
        return (
            <div className='App'>
                <img className='logo' src={logo}>
                </img>
                <br />
                <div> Welcome to the Climate-Chain</div>
                <br />
                <div><Link to='/blocks'>Go to Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Go to Create Transaction Page</Link></div>
                <div><Link to='/transaction-pool'>Go to Transaction List</Link></div>
                <br />
                <div className="WalletInfo"> 
                    <div>Address: {address} </div>
                    <div>Balance: {balance}</div>
                </div>
            </div>
        );
    }
}

export default App;

