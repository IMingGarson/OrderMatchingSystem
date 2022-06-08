import React from 'react';

export default function Header({ticker}) {
    return (
        <div className="title">
            <p>{ ticker }</p>
            <p className="sub">NasdaqGS - NasdaqGS Real Time Price. Currency in USD</p>
            <div className="price-changes">
                <div className="price-details">
                    <p className="price">137.59<span className="green">&nbsp;&nbsp;+0.24 (+0.17%)</span></p>
                    <p className="sub">At close: 04:00PM EDT</p>
                </div>
                <div className="price-details">
                    <p className="price">137.58<span className="red">&nbsp;&nbsp;-0.01 (-0.01%)</span></p>
                    <p className="sub">After hours: 07:59PM EDT</p>
                </div>
            </div>
            <style>{`
                .title {
                    font-size: 30px;
                    color: black;
                    padding: 0 2rem;
                    margin: 0 1rem;
                    font-weight: bold;
                }
                .sub {
                    font-size: 18px;
                    color: #5b636a;
                    font-weight: 500;
                }
                .price-changes {
                    display: flex;
                    flex-direction: row;
                }
                .price-details {
                    display: flex;
                    flex-direction: column;
                    margin-right: 5rem;
                    color: black;
                }
                .price {
                    display: flex;
                    font-size: 28px;
                    font-weight: bold;
                }
                .green {
                    color: green;
                }
                .red {
                    color: red;
                }
            `}</style>
        </div>
    )
}