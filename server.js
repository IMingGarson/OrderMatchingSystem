const express = require("express");
const app = express();
const cors = require('cors');
const corsOptions = {
    origin: [
        'http://localhost:3000',
    ],
    methods: 'GET,POST',
    allowedHeaders: ['Content-Type', 'application/json'],
};
const server = require("http").Server(app);
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const io = require("socket.io")(server);
let ASK_ORDER_BUCKET = [];
let BID_ORDER_BUCKET = [];
let MATCHED_ASK_ORDER_BUCKET = [];
let MATCHED_BID_ORDER_BUCKET = [];
let SHOW_ASK_ORDER_BUCKET = [];
let SHOW_BID_ORDER_BUCKET = [];
let BACKEND_ASK_ORDER_BUCKET = [];
let BACKEND_BID_ORDER_BUCKET = [];
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

nextApp.prepare().then(() => {

    app.get("*", (req, res) => {
        return handle(req, res);
    });

    // match all orders every 30 seconds
    setInterval(() => {
        matchOrders()
    }, 10000);

    app.post('/api/placeOrder', function (req, res) {
        const { id, action, quantity, price, time, userId } = req.body.data;
        if (!id || !action || !quantity || !price || isNaN(userId)) {
            return res.json({ success: false, alert: 'System error!' });
        }
        if (action == 0) {
            ASK_ORDER_BUCKET.push({
                id: id, // order id
                price: +price, // order price
                userId: userId, // user id
                quantity: +quantity, // quantity
                filledQty: +quantity, // filled quantity
                unfilledQty: +quantity, // unfilled quantity
                fullyfilled: false, // ture if unfilledQty is 0
                partiallyfilled: false, // ture if unfilledQty is not 0
                matchedOrderID: [], // orders that match this order
                time: time, // order placed time
            });

            SHOW_ASK_ORDER_BUCKET.push({
                id: id, // order id
                price: +price, // order price
                userId: userId, // user id
                quantity: +quantity, // quantity
                filledQty: +quantity, // filled quantity
                unfilledQty: +quantity, // unfilled quantity
                fullyfilled: false, // ture if unfilledQty is 0
                partiallyfilled: false, // ture if unfilledQty is not 0
                matchedOrderID: [], // orders that match this order
                time: time, // order placed time
            });

        } else if (action == 1) {
            BID_ORDER_BUCKET.push({
                id: id, // order id
                price: +price, // order price
                userId: userId, // user id
                quantity: +quantity, // quantity
                filledQty: +quantity, // filled quantity
                unfilledQty: +quantity, // unfilled quantity
                fullyfilled: false, // ture if unfilledQty is 0
                partiallyfilled: false, // ture if unfilledQty is not 0
                matchedOrderID: [], // orders that match this order
                time: time, // order placed time
            });

            SHOW_BID_ORDER_BUCKET.push({
                id: id, // order id
                price: +price, // order price
                userId: userId, // user id
                quantity: +quantity, // quantity
                filledQty: +quantity, // filled quantity
                unfilledQty: +quantity, // unfilled quantity
                fullyfilled: false, // ture if unfilledQty is 0
                partiallyfilled: false, // ture if unfilledQty is not 0
                matchedOrderID: [], // orders that match this order
                time: time, // order placed time
            });
        }

        // The order for sorting by time is ascending for bid-side orders and descending for ask-side orders
        // refenerce: https://stackoverflow.com/questions/13112062/which-are-the-order-matching-algorithms-most-commonly-used-by-electronic-financi
        ASK_ORDER_BUCKET.sort(function(a, b){
            return b.price - a.price || new Date(a.time) - new Date(b.time);
        });
        SHOW_ASK_ORDER_BUCKET.sort(function(a, b){
            return b.price - a.price || new Date(b.time) - new Date(a.time);
        });
        BID_ORDER_BUCKET.sort(function(a, b){
            return b.price - a.price || new Date(b.time) - new Date(a.time);
        });
        SHOW_BID_ORDER_BUCKET.sort(function(a, b){
            return b.price - a.price || new Date(b.time) - new Date(a.time);
        });

        if (MATCHED_ASK_ORDER_BUCKET.length) {
            ASK_ORDER_BUCKET = ASK_ORDER_BUCKET.filter((order) => {
                return !MATCHED_ASK_ORDER_BUCKET.some((matchedOrder) => {
                    return order.id === matchedOrder.id && matchedOrder.fullyfilled
                });
            });
        }

        if (MATCHED_BID_ORDER_BUCKET.length) {
            BID_ORDER_BUCKET = BID_ORDER_BUCKET.filter((order) => {
                return !MATCHED_BID_ORDER_BUCKET.some((matchedOrder) => {
                    return order.id === matchedOrder.id && matchedOrder.fullyfilled
                });
            });
        }
    
        console.log('BID_ORDER_BUCKET', BID_ORDER_BUCKET);
        console.log('ASK_ORDER_BUCKET', ASK_ORDER_BUCKET);

        return res.json({ success: true, alert: 'Your order is placed' });

    });

    io.on('connection', (socket) => {
        socket.on("require orderbook", (data) => {
            socket.emit('response orderbook', {
                ticker: data.ticker, 
                orderbook: {
                    ask: SHOW_ASK_ORDER_BUCKET.slice(0, 5),
                    bid: SHOW_BID_ORDER_BUCKET.slice(0, 5)
                }
            })
        });

        socket.on('matchedOrderFetcher', function(data) {
            const { userID } = data;
            console.log('matchedOrderFetcher userID', userID)
            MATCHED_ASK_ORDER_BUCKET.map(function(order) {
                socket.emit(`matchedOrderFetcher-${userID}`, {
                    action: 'SELL', 
                    message: `[SELL] Your order ${order.id} has been filled. Filled Qty: ${order.filledQty} at price: $${order.price}`
                });
            });

            MATCHED_BID_ORDER_BUCKET.map(function(order) {
                socket.emit(`matchedOrderFetcher-${userID}`, {
                    action: 'BUY', 
                    message: `[BUY] Your order ${order.id} has been filled. Filled Qty: ${order.filledQty} at price: $${order.price}`
                });
            });

        });

        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

    });

    server.listen(3000, () => { console.log("on 3000"); } );
});


function matchOrders() {

    while (ASK_ORDER_BUCKET.length && BID_ORDER_BUCKET.length) {
        // TODO: should not be the same user
        let current_ASK = ASK_ORDER_BUCKET.pop(0);
        let current_BID = BID_ORDER_BUCKET.pop(0);

        // if the quantity of unfilled shares of the order is equal to its match
        // we substract the quantity and match these 2 orders
        if (current_ASK.unfilledQty == current_BID.unfilledQty) {

            current_ASK.filledQty = current_ASK.quantity;
            current_BID.filledQty = current_BID.quantity;

            current_ASK.unfilledQty = 0;
            current_BID.unfilledQty = 0;

            current_ASK.fullyfilled = true;
            current_BID.fullyfilled = true;

            current_ASK.partiallyfilled = false;
            current_BID.partiallyfilled = false;

            current_ASK.matchedOrderID.push({
                id: current_BID.id,
                price: current_BID.price,
                filledQty: current_BID.quantity,
                notified: false
            });

            current_BID.matchedOrderID.push({
                id: current_ASK.id,
                price: current_ASK.price,
                filledQty: current_ASK.quantity,
                notified: false
            });
        }
        else if (current_ASK.unfilledQty > current_BID.unfilledQty) {
            // if the quantity of unfilled shares of the order is greater than its match
            // we substract the quantity from order and fulfilled its match

            current_ASK.filledQty = current_BID.quantity;
            current_BID.filledQty = current_BID.quantity;

            current_ASK.unfilledQty = current_ASK.quantity - current_ASK.filledQty;
            current_BID.unfilledQty = 0;

            current_ASK.fullyfilled = false;
            current_BID.fullyfilled = true;

            current_ASK.partiallyfilled = true;
            current_BID.partiallyfilled = false;

            current_ASK.matchedOrderID.push({
                id: current_BID.id,
                price: current_BID.price,
                filledQty: current_BID.quantity,
                notified: false
            });

            current_BID.matchedOrderID.push({
                id: current_ASK.id,
                price: current_ASK.price,
                filledQty: current_BID.quantity,
                notified: false
            });

            ASK_ORDER_BUCKET.push({
                id: current_ASK.id, // order id
                price: current_ASK.price, // order price
                userId: current_ASK.userId, // user id
                quantity: current_ASK.quantity, // quantity
                filledQty: current_ASK.filledQty, // filled quantity
                unfilledQty: current_ASK.unfilledQty, // unfilled quantity
                fullyfilled: current_ASK.fullyfilled, // ture if unfilledQty is 0
                partiallyfilled: current_ASK.partiallyfilled, // ture if unfilledQty is not 0
                matchedOrderID: current_ASK.matchedOrderID, // orders that match this order
                time: new Date(), // order placed time
            });

        } else {
            // if the quantity of unfilled shares of the order is less than its match
            // we substract the volumn from its match and fulfill the order
            current_ASK.filledQty = current_ASK.quantity;
            current_BID.filledQty = current_ASK.quantity;

            current_ASK.unfilledQty = 0;
            current_BID.unfilledQty = current_BID.quantity - current_BID.filledQty;

            current_ASK.fullyfilled = true;
            current_BID.fullyfilled = false;

            current_ASK.partiallyfilled = false;
            current_BID.partiallyfilled = true;

            current_ASK.matchedOrderID.push({
                id: current_BID.id,
                price: current_BID.price,
                filledQty: current_ASK.quantity,
                notified: false
            });

            current_BID.matchedOrderID.push({
                id: current_ASK.id,
                price: current_ASK.price,
                filledQty: current_ASK.quantity,
                notified: false
            });

            BID_ORDER_BUCKET.push({
                id: current_BID.id, // order id
                price: current_BID.price, // order price
                userId: current_BID.userId, // user id
                quantity: current_BID.quantity, // quantity
                filledQty: current_BID.filledQty, // filled quantity
                unfilledQty: current_BID.unfilledQty, // unfilled quantity
                fullyfilled: current_BID.fullyfilled, // ture if unfilledQty is 0
                partiallyfilled: current_BID.partiallyfilled, // ture if unfilledQty is not 0
                matchedOrderID: current_BID.matchedOrderID, // orders that match this order
                time: new Date(), // order placed time
            });
        }

        // TODO: when matched, save that record to DB
        MATCHED_ASK_ORDER_BUCKET.push(current_ASK);
        MATCHED_BID_ORDER_BUCKET.push(current_BID);
    }

    console.log('MATCHED_ASK_ORDER_BUCKET', MATCHED_ASK_ORDER_BUCKET);
    console.log('MATCHED_BID_ORDER_BUCKET', MATCHED_BID_ORDER_BUCKET);
    
    return true;
}

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}