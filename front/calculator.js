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
            this.displayLabel = 'x:';
            this.nextCoordinate = 'x';
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
            if (this.currentInput) {
                this.currentInput = String(parseFloat(this.currentInput) / 100);
                this.result = this.currentInput;
            }
            this.previousKey = 'percentage';
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

        drawGraph() {
            this.showGraph = true;
        
            Alpine.nextTick(() => {
                const ctx = document.getElementById('graphCanvas')?.getContext('2d');
                if (!ctx) return alert('Canvas not found');
                const sortedPoints = [...this.graphPoints].sort((a, b) => a.x - b.x);
                const data = {
                    datasets: [{
                        label: 'Line Graph',
                        data: sortedPoints,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false,
                        tension: 0.2
                    }]
                };
                if (this.chart) {
                    this.chart.destroy();
                }
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'X Axis'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Y Axis'
                                }
                            }
                        }
                    }
                });
            });
        },
        resetGraph() {
            this.points = [];
            this.xVal = '';
            this.yVal = '';
            this.showGraph = false;

            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }
    }
}