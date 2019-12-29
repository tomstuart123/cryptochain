import React from 'react';

// make component stateless as a function rather than class

// as statelesss can't pass data from block as a prop normally. Instead we receive it as a parameter e.g. ( const Transaction = (props) => { ). However, easier to destructure the transaction out in the parameter straight away

const Transaction = ({transaction}) => {
    
    const { input, outputMap } = transaction;
    // get recipients from all the keys
    const recipients = Object.keys(outputMap)

    return (
        <div className='Transaction'>
            <div>From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
            {
                recipients.map(recipient => (
                    <div key={recipient}>
                        To: {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
                    </div>
                ))
            }
        </div>
    )
}

export default Transaction;