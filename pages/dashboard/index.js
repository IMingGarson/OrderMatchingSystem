import React, { useState, useEffect } from 'react';
import Io from "socket.io-client";
const socket = Io();

export default function Dashboard({ userID }) {
    console.log('dashboard user id', userID);
    const [dashboard, setDashboard] = useState({
        orderbook: {
            ask: [],
            bid: []
        }
    });
    let dashboardFetcher;
    let matchedOrderFetcher;
    useEffect(() => {
        socket.on('connect', function() {
            // get orders every 5 seconds
            dashboardFetcher = setInterval(() => {
                socket.emit('require orderbook', { ticker: 'APPL', at: new Date() });
            }, 5000)
            
            // to see if there are orders matched every 10 seconds
            matchedOrderFetcher = setInterval(() => {
                socket.emit('matchedOrderFetcher', { userID: userID });
                socket.on(`matchedOrderFetcher-${userID}`, (data) => {
                    alert(data.message);
                    console.log('matchedOrderFetcher', data.message);
                });
            }, 10000)

            socket.on('response orderbook', (data) => {
                console.log('orderbook', data);
                setDashboard(data);
            });
        });
        socket.on('disconnect', function() {
            clearInterval(dashboardFetcher);
            clearInterval(matchedOrderFetcher);
            dashboardFetcher = undefined;
            matchedOrderFetcher = undefined;
        });
    }, [])

    const { ask = [], bid = [] } = dashboard.orderbook
    return (
        <div href="https://nextjs.org/docs" className="card">
            <h3>Real Time Dashboard</h3>
            <div className="real-time-details">
                <div className="details buy">
                    <span>BUY <br/>Qty.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pr.</span>
                    {
                        bid.map((item, index) => {
                            if (index == 0) {
                                return <p className="new-placed-order" key={item.time + Math.random().toString()}>{item.quantity}&nbsp;&nbsp;&nbsp;&nbsp;{item.price}</p>
                            }
                            return <p key={item.time}>{item.quantity}&nbsp;&nbsp;&nbsp;&nbsp;{item.price}</p>
                        })
                    }
                </div>
                <div className="details sell">
                    <span>SELL <br/>Qty.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pr.</span>
                    {
                        ask.map((item, index) => {
                            if (index == 0) {
                                return <p className="new-placed-order" key={item.time + Math.random().toString()}>{item.quantity}&nbsp;&nbsp;&nbsp;&nbsp;{item.price}</p>
                            }
                            return <p key={item.time}>{item.quantity}&nbsp;&nbsp;&nbsp;&nbsp;{item.price}</p>
                        })
                    }
                </div>
            </div>
            <style jsx>{`
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

                .real-time-details {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                }
                
                .details {
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                    width: 50%;
                    margin: .75rem .2rem;
                }
                
                .details span {
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                    border: 1px solid #eaeaea;
                    border-radius: 10px;
                    background-color: #e9e9e9;
                    margin: .75rem .2rem;
                    color: black;
                    font-weight: 500;
                }
                .buy {
                    color: green;
                }
                .sell {
                    color: red;
                }

                .new-placed-order {
                    animation: bg-color-change 1.5s ease;
                }

                @keyframes bg-color-change {
                    from { background-color: #e9e9e9; }
                    to { background-color: #ffffff; }
                }
            `}</style>
        </div>
    )
}