import React, { Component } from 'react';
// get already built forms from bootstrap
import { FormGroup, FormControl, Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import history from '../history'

class ConductTransaction extends Component {
    // track user input in state
    state = {
        recipient: '',
        amount: 0,
    }

    updateRecipient = event => {
        //as user types track it using the method on any event
        this.setState({
            recipient: event.target.value
        })
    }

    updateAmount = event => {
        this.setState({
            amount: Number(event.target.value)
        })
    }

    conductTransaction = () => {
        const {recipient, amount } = this.state;
        // post request using fetch. add data f
        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ recipient, amount })
        }).then(response => 
            response.json())
            .then(json => {
                // provides message if success and show error if no message
                alert(json.message || json.type);
                history.push('/transaction-pool');
            })
        
    }

    render() {
        return (
            <div className='ConductTransaction'>
                <Link to='/'>Go Home</Link>
                <h3>Conduct a new transaction</h3>
                <FormGroup>
                    <FormControl input='text' placeholder='recipient' value={this.state.recipient} onChange={this.updateRecipient} />
                </FormGroup>
                <FormGroup>
                    <FormControl input='number' placeholder='amount' value={this.state.amount} onChange={this.updateAmount} />
                </FormGroup>
                <Button bsStyle='danger' onClick={this.conductTransaction}>Submit Transaction</Button>
            </div>
        )
    }


}

export default ConductTransaction;