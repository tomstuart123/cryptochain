import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction'
import TransactionPool from './components/TransactionPool'
import App from './components/App';
import './index.css';

// key to render things to the page. dynamically added react components to html function
import { render } from 'react-dom'

render(
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={App} />
            <Route path='/blocks' component={Blocks} />
            <Route path='/conduct-transaction' component={ConductTransaction} />
            <Route path='/transaction-pool' component={TransactionPool} />
        </Switch>
    </Router>,
    // document object provides a get element by ID method. Grab the rood
    document.getElementById('root')
)