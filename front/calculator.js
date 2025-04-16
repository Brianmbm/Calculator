//TODO: When adding last y-point it should be enough to click on draw not have to click plus and then draw
function calculator() {
    return {
        mode: 'calc',
        currentInput: '0',
        result: '',
        operation: null,
        previousKey: '',
        displayLabel: 'x:',
        nextCoordinate: 'x',
        tempX: null,
        graphPoints: [],
        chart: null,
        showGraph: false,

        toggleMode() {
            this.mode = this.mode === 'calc' ? 'graph' : 'calc';
            if (this.showGraph == true) {this.showGraph = false};
            this.clearAll();
        },

        clearAll() {
            this.currentInput = '0';
            this.result = '';
            this.operation = null;
            this.previousKey = '';
            this.resetGraph();
        },

        inputDigit(digit) {
            if (this.currentInput === 'Infinity' || this.previousKey === 'operator' || this.previousKey === 'calculate') {
                this.currentInput = '0';
            }
            if (this.currentInput === '0') {
                this.currentInput = '';
            }
            this.currentInput += digit;
            this.previousKey = 'digit';
        },

        inputDecimal() {
            if (!this.currentInput.includes('.')) {
                this.currentInput += '.';
            }
            this.previousKey = 'decimal';
        },

        inputOperation(operator) {
            if (this.operation && this.previousKey === 'digit') {
                this.calculate();
            }
            this.operation = operator;
            this.result = this.currentInput;
            this.previousKey = 'operator';
        },

        toggleSign() {
            this.currentInput = this.currentInput ? String(-parseFloat(this.currentInput)) : '';
            this.previousKey = 'toggleSign';
        },

        calculatePercentage() {
            const current = parseFloat(this.currentInput);
            if (isNaN(current)) return;

            fetch('http://127.0.0.1:5000/percentage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: current })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }

                let result = data.result;
                const maxDigits = 10;

                if (result.toString().length > maxDigits || result === 0) {
                    result = result.toExponential(3);
                } else {
                    const decimalPlaces = maxDigits - Math.floor(result).toString().length;
                    result = parseFloat(result.toFixed(decimalPlaces < 0 ? 0 : decimalPlaces));
                }

                this.currentInput = String(result);
                this.result = this.currentInput;
                this.previousKey = 'percentage';
            })
            .catch(err => {
                alert('Server error: ' + err.message);
            });
        },

        calculate() {
            const current = parseFloat(this.currentInput);
            const previous = parseFloat(this.result);

            if (isNaN(previous) || isNaN(current)) return;

            fetch('http://127.0.0.1:5000/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    a: previous,
                    b: current,
                    operator: this.operation
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }

                let result = data.result;
                const maxDigits = 10;

                if (result.toString().length > maxDigits || result === 0) {
                    result = result.toExponential(3);
                } else {
                    const decimalPlaces = maxDigits - Math.floor(result).toString().length;
                    result = parseFloat(result.toFixed(decimalPlaces < 0 ? 0 : decimalPlaces));
                }

                this.currentInput = String(result);
                this.operation = null;
                this.result = '';
                this.previousKey = 'calculate';
            })
            .catch(err => {
                alert('Server error: ' + err.message);
            });
        },

        addGraphInput() {
            const num = parseFloat(this.currentInput);
            if (isNaN(num)) return alert('Invalid input');

            if (this.nextCoordinate === 'x') {
                this.tempX = num;
                this.displayLabel = 'y:';
                this.nextCoordinate = 'y';
            } else {
                this.graphPoints.push({ x: this.tempX, y: num });
                this.tempX = null;
                this.nextCoordinate = 'x';
                this.displayLabel = 'x:';
            }

            this.currentInput = '0';
        },
        calculateRegressionLine() {
            if (this.graphPoints.length < 2) {
                alert('At least two points are required for regression');
                return;
            }

            return fetch('http://127.0.0.1:5000/regression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points: this.graphPoints })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return null;
                }
                return {
                    xIntercept: data.xIntercept,
                    yIntercept: data.yIntercept
                };
            })
            .catch(err => {
                alert('Server error: ' + err.message);
                return null;
            });
        },
        drawGraph() {
            this.showGraph = true;
            Alpine.nextTick(() => {
                const ctx = document.getElementById('graphCanvas')?.getContext('2d');
                if (!ctx) return alert('Canvas not found');
                const sortedPoints = [...this.graphPoints].sort((a, b) => a.x - b.x);
                const data = {
                    datasets: [{
                        data: sortedPoints,
                        borderColor: 'rgb(236, 236, 236)',
                        backgroundColor: 'rgba(250, 250, 250, 0.2)',
                        fill: false,
                        tension: 0.2
                    }],
                };
                if (this.chart) {
                    this.chart.destroy();
                    this.chart = null;
                }
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: {
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    title: () => null
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                title: {
                                    display: false,
                                    text: 'X Axis'
                                }
                            },
                            y: {
                                title: {
                                    display: false,
                                    text: 'Y Axis'
                                }
                            }
                        }
                    }
                });
                this.calculateRegressionLine().then((res) => {
                    if (!res) return;
                    const { xIntercept, yIntercept } = res;
                    const interceptDiv = document.getElementById('interceptInfo');
                    interceptDiv.innerHTML = `
                        <strong>y-intercept:</strong> ${yIntercept.toFixed(2)}<br>
                        <strong>x-intercept:</strong> ${xIntercept !== null ? xIntercept.toFixed(2) : 'undefined'}
                    `;
                });
            });
        },
        resetGraph() {

            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }

            this.graphPoints = [];
            this.tempX = null;
            this.nextCoordinate = 'x';
            this.displayLabel = 'x:';
            this.showGraph = false;
            const interceptEl = document.getElementById("interceptInfo");
            if (interceptEl) interceptEl.textContent = '';
        }
    }
}