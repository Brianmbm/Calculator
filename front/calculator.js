function calculator() {
    return {
        currentInput: '0',
        result: '',
        operation: null,
        previousKey: '',
        clearAll() {
          this.currentInput = '0';
          this.result = '';
          this.operation = null;
          this.previousKey = '';
        },
        clearEntry() {
            this.currentInput = '';
        },
        inputDigit(digit) {
          const maxDigits = 10;

          if (this.currentInput === 'Infinity') {
              return;
          }

          if (this.previousKey === 'operator' || this.previousKey === 'calculate') {
              this.currentInput = '0';
          }
          if (this.currentInput === '0') {
              this.currentInput = '';
          }
          this.currentInput += digit;
          this.previousKey = 'digit';

          if (this.currentInput.length > maxDigits) {
              this.currentInput = parseFloat(this.currentInput).toExponential(3);
          }
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
        }
    }}
    function lineGraph() {
        return {
            xVal: '',
            yVal: '',
            points: [],
            chart: null,
    
            addPoint() {
                if (!isNaN(this.xVal) && !isNaN(this.yVal)) {
                    this.points.push({ x: this.xVal, y: this.yVal });
                    this.xVal = '';
                    this.yVal = '';
                } else {
                    alert('Please enter valid x and y values');
                }
            },
    
            drawGraph() {
                const ctx = document.getElementById('graphCanvas').getContext('2d');
    
                const sortedPoints = [...this.points].sort((a, b) => a.x - b.x);
    
                const data = {
                    datasets: [{
                        label: 'Line Graph',
                        data: sortedPoints,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                };
    
                if (this.chart) {
                    this.chart.destroy(); // Reset chart if it already exists
                }
    
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
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
            }
        }
    }