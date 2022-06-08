import { useRouter } from "next/router";
import Chart from "../charts";
import Dashboard from "../dashboard";
import OrderPanel from "../orderpanel";
import Header from "../Header";

export async function getServerSideProps() {
    const stockReq = await fetch(`https://demo-live-data.highcharts.com/aapl-c.json`);
    const stockData = await stockReq.json();

    return {
        props: {
            stock: stockData,
        }
    }
}

export default function Ticker({ stock }) {
    const router = useRouter()
    const { ticker } = router.query
    const userID = 1;
    return (
        <div className="container">
            <Header ticker={ ticker } />
            <Chart stock={ stock } />
            <div className="grid">
                <Dashboard userID={ userID } />
                <OrderPanel userID={ userID } />
            </div>
            <style jsx>{`
                .grid {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-direction: row;
                }
            `}</style>
        </div>
    )
}