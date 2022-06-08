import React from 'react';
import axios from 'axios';

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export async function formHandler(event, userID) {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()
    console.log('formHandler user id', userID);
    // Get data from the form.
    const data = {
        id: '1018' + makeid(6),
        quantity: event.target.quantity.value,
        price: event.target.price.value,
        action: event.target.tradeAction.value,
        userId: userID, // stimulate multiple users' orders
        time: new Date()
    }
    const HOST = 'http://localhost:3000';
    const res = await axios.post(HOST + '/api/placeOrder', {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin':'*' 
        },
        data: data,
    });
    if (!res.data) {
        alert('System Error!');
    }
    alert(res.data.alert);
}

export default function OrderPanel({ userID }) {
    return (
        <div href="https://nextjs.org/learn" className="card">
            <h3>Make An Order</h3>
            <form onSubmit={(e) => { formHandler(e, userID) }}>
                
                <label htmlFor="quantity">Quantity</label>
                <div className="input-group mb-3">
                    <input type="text" name="quantity" className="form-control" required 
                    />
                </div>

                <label htmlFor="price">Price</label>
                <div className="input-group mb-3">
                    <input type="text" name="price" className="form-control" required
                    />
                </div>
                
                <div className="input-group action-btns">
                    <div className="input-group-text green action-btn">
                        <input name="tradeAction" className="form-check-input mt-0" type="radio" value="1" />BUY
                    </div>
                    <div className="input-group-text red action-btn">
                        <input name="tradeAction" className="form-check-input mt-0" type="radio" value="0" />SELL
                    </div>
                </div>
                <div className="col-auto">
                    <button type="submit" className="btn btn-primary mt-3">Confirm Order</button>
                </div>
            </form>
            <style jsx>{`
                .grid {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-direction: row;
                }
                .card {
                    display: flex;
                    height: 350px;
                    margin: 1rem;
                    flex-basis: 45%;
                    padding: 1.5rem;
                    text-align: left;
                    border: 1px solid #eaeaea;
                    border-radius: 10px;
                    transition: color 0.15s ease, border-color 0.15s ease;
                    cursor: default;
                }
                .card:hover,
                .card:focus {
                    border-color: #0070f3;
                }
                .green {
                    color: green;
                }
                .red {
                    color: red;
                }
                .input-group {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-evenly;
                }
                .action-btns {
                    justify-content: flex-start;
                }
                .action-btn {
                    margin-right: 0.5rem;
                    border-radius: 5px;
                }
            `}</style>
        </div>
    )
}