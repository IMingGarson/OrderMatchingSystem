import React from 'react'
import Highcharts from "highcharts/highstock";
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import { useRouter } from "next/router";

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts)
}

export default function Chart({ stock }) {
    const router = useRouter()
    const { ticker } = router.query
    const chartParams = {
        rangeSelector: {
            selected: 1
        },

        title: {
            text: `${ ticker.toUpperCase() } Stock Chart`
        },

        series: [{
            name: ticker,
            data: stock,
            tooltip: {
                valueDecimals: 2
            }
        }]
    }

    return (
        <div className="chartCard">
            <HighchartsReact
                highcharts={Highcharts}
                options={chartParams}
                constructorType={"stockChart"}
            />
        <style jsx>{
            `
                .chartCard {
                    margin: 1rem;
                    flex-basis: 45%;
                    padding: 0.5rem;
                    text-align: center;
                    color: inherit;
                    text-decoration: none;
                    border: 1px solid #eaeaea;
                    border-radius: 10px;
                    transition: color 0.15s ease, border-color 0.15s ease;
                }
            `
        }

        </style>
        </div>
    )
}