import React from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';

const options = [
    { value: 'GME', label: 'GameStop' },
    { value: 'AAPL', label: 'Apple' },
    { value: 'BLK', label: 'BlackRock' },
    { value: 'GOOGL', label: 'Alphabet A' },
    { value: 'GS', label: 'Goldman Sachs' },
  ];

class Stock extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            stockChartXValues : [],
            stockChartYValues : [],
            stockChartHighValues : [],
            stockChartLowValues : [],
            stockChartCloseValues : [],
            candleStickDateRange: [],
            candleStickValueRange: [],
            selectedOption : null,
        }
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption });
        console.log(`Option selected:`, selectedOption);
        this.fetchStock(selectedOption.value);
    };

    componentDidMount(){
        // this.fetchStock('GME');
    }

    fetchStock(symbol) {
        const pointerToThis = this;
        const API_KEY = 'MSCCNWV4G1M6UP4G';
        let stock_Symbol = 'GME';

        if (symbol != null)
            stock_Symbol = symbol;
        
        let api_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stock_Symbol}&outputsize=compact&apikey=${API_KEY}`;
        let stockChartXValuesFunction = [];
        let stockChartYValuesFunction = [];
        let stockChartHighValuesFunction = [];
        let stockChartLowValuesFunction = [];
        let stockChartCloseValuesFunction = [];
        let candleStickDateRangeFunction = [];
        let candleStickValueRangeFunction = [];

        fetch(api_Call)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                // console.log(data);

                for(var key in data['Time Series (Daily)']){
                    stockChartXValuesFunction.push(key);
                    stockChartYValuesFunction.push(data['Time Series (Daily)'][key]['1. open']);
                    stockChartHighValuesFunction.push(data['Time Series (Daily)'][key]['2. high']);
                    stockChartLowValuesFunction.push(data['Time Series (Daily)'][key]['3. low']);
                    stockChartCloseValuesFunction.push(data['Time Series (Daily)'][key]['4. close']);

                    if (candleStickDateRangeFunction.length === 0){
                        candleStickDateRangeFunction.push(key);
                        candleStickDateRangeFunction.push(key);
                    }
                    else if (new Date(key) < new Date(candleStickDateRangeFunction[0]))
                        candleStickDateRangeFunction[0] = key;
                    else if (new Date(key) > new Date(candleStickDateRangeFunction[1]))
                        candleStickDateRangeFunction[1] = key;

                    if (candleStickValueRangeFunction.length === 0){
                        candleStickValueRangeFunction.push(data['Time Series (Daily)'][key]['3. low']);
                        candleStickValueRangeFunction.push(data['Time Series (Daily)'][key]['2. high']);
                    }
                    if (data['Time Series (Daily)'][key]['3. low'] < candleStickValueRangeFunction[0])
                        candleStickValueRangeFunction[0] = data['Time Series (Daily)'][key]['3. low'];
                    if (data['Time Series (Daily)'][key]['2. high'] > candleStickValueRangeFunction[1])
                        candleStickValueRangeFunction[1] = data['Time Series (Daily)'][key]['2. high'];                        
                }

                console.log(candleStickDateRangeFunction);
                // console.log(candleStickValueRangeFunction);

                pointerToThis.setState({
                    stockChartXValues : stockChartXValuesFunction,
                    stockChartYValues : stockChartYValuesFunction,
                    stockChartHighValues : stockChartHighValuesFunction,
                    stockChartLowValues : stockChartLowValuesFunction,
                    stockChartCloseValues : stockChartCloseValuesFunction,
                    candleStickDateRange : candleStickDateRangeFunction,
                    candleStickValueRange : candleStickValueRangeFunction,
                })
            })
    }

    render(){
        const { selectedOption } = this.state;

        return (
            <div>
                <h1>Stock market</h1>
                
                <Select
                    // defaultValue = {'GME'}
                    value={selectedOption}
                    onChange={this.handleChange}
                    options={options}
                />

                <Plot
                    data={[
                    {
                        x: this.state.stockChartXValues,
                        y: this.state.stockChartYValues,
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'red'},
                    }
                    ]}
                    layout={ {width: 720, height: 440, title: 'Scatter Plot'} }
                />

                <Plot
                    data={[
                    {
                        x: this.state.stockChartXValues,
                        close: this.state.stockChartCloseValues,
                        decreasing: {line: {color: 'red'}}, 
                        high: this.state.stockChartHighValues,
                        increasing: {line: {color: 'green'}}, 
                        line: {color: 'rgba(31,119,180,1)'}, 
                        low: this.state.stockChartLowValues,
                        open: this.state.stockChartYValues,
                        type: 'candlestick', 
                        xaxis: 'x', 
                        yaxis: 'y'
                    }
                    ]}
                    layout={ {width: 720, height: 440, title: 'CandleStick Plot',
                        dragmode: 'zoom', 
                        margin: {
                        r: 10, 
                        t: 25, 
                        b: 40, 
                        l: 60
                        }, 
                        showlegend: false, 
                        xaxis: {
                            autorange: true, 
                            domain: [0, 1], 
                            range: this.state.candleStickDateRange, 
                            rangeslider: {range: this.state.candleStickDateRange}, 
                            title: 'Date', 
                            type: 'date'
                        }, 
                        yaxis: {
                            autorange: true, 
                            domain: [0, 1], 
                            // range: this.state.candleStickValueRange, 
                            type: 'linear'
                        }
                } }
                />
            </div>
        )
    }
}

export default Stock;