import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import Transaction from './Transaction';
import history from '../history';

// set global value of interval in 10 seconds
const POLL_INTERVAL_MS = 10000;


class TransactionPool extends Component {
    // fetch data 
    state = {
        // empty object as the data stored in API via object
        transactionPoolMap: {}
    }


    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => this.setState({
                transactionPoolMap: json
            }))
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            // note this doesn't actually accept json like others
            // if successful send them to blocks page, if not error
            .then(response => {
                if(response.status === 200) {
                    alert('success');
                    history.push('/blocks')
                } else {
                    alert('The request did not complete, please try again later')
                }
            })
            
    }

    componentDidMount() {
        this.fetchTransactionPoolMap();
        // reminder store it in a variable so we can cancel it below
        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        )
    }

    componentWillUnmount() {
        // clear this when page is running
        clearInterval(this.fetchPoolMapInterval)
    }

    render() {
        return (
            <div className='TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                <hr />
                <Button
                    bsStyle="danger"
                    onClick={this.fetchMineTransactions}
                >
                    Mine the Transactions
        </Button>
            </div>
        )
    }
}

export default TransactionPool;