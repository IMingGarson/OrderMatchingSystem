# About This Repository

The OrderMatchingSystem is a simple FIFO algorithm application, which simulates how modern banking systems handle stock orders.

I use NextJS and NodeJS for frontend and backend respectively. They comunicate each other via traditional REST APIs and WebSocket.


# Stock Orders

For simplicity, I only define orders with two types: `BUY` and `SELL` and don't consider limit order, options and futures trading.


# First In First Out

The matching logic is based on First In First Out aka FIFO algorithm. 

In order to create as many valid trade as possible, the BUY and SELL orders are sorted in a time-price manner. That is, the `earlier` an order is, the `higher` its priority in a queue.


# How To Run

Make sure you have Node installed on your machine and git clone this repo, run `npm install` and `npm start` afterwards.

Once done, open this link `http:localhost/ticker/APPL` to see the website.


# Future Work

1. Find a dynamic open data for real-time stock market.
2. Split API endpoints and Orderbook into microservices.
3. Containerize both frontend and backend.
4. Deploy this on a real server like GCP or a third-party host like Netlify.
5. Introduce CI/CD pipeline.
6. Introduce testing tools such as Selenium.
7. TBD.


# Reference

1. [HighChat](https://www.highcharts.com/)
2. [Stock trading algorithm](https://stackoverflow.com/questions/13112062/which-are-the-order-matching-algorithms-most-commonly-used-by-electronic-financi)
