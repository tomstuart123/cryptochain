import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = { 
        displayTransaction: false
    }

    toggleTransaction = () => {
        this.setState({
            displayTransaction: !this.state.displayTransaction
        })
    }

    get displayTransaction() {
        const { data } = this.props.block;

        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length > 35 ?
            `${stringifiedData.substring(0, 35)}...` :
            stringifiedData;
        // if display transaction is true, then use full data
        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        ))
                    }
                    <br />
                    <Button bsStyle='danger' bsSize='small' onClick={this.toggleTransaction}> Show Less
                    </Button>
                </div>
            )
        } 
        // else if display transaction is false, then use summary of data
        return (
            <div> 
                <div>Data: {dataDisplay}</div>
                <Button bsStyle='danger' bsSize='small' onClick={this.toggleTransaction}> Show More
                </Button>
            </div>
        )
    }
    
    render() {
        // receive block passed from blocks as a PROP
        const {timestamp, hash } = this.props.block;
        // render just part of the hash
        const hashDisplay = `${hash.substring(0, 15)}...`

        return (
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        )
    }
}

export default Block;