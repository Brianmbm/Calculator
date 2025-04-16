from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/percentage', methods=['POST'])
def percentage():
    data = request.json
    try:
        value = float(data.get('value', 0))
        result = value / 100
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    a = float(data.get('a', 0))
    b = float(data.get('b', 0))
    op = data.get('operator')

    try:
        if op == '+':
            result = a + b
        elif op == '-':
            result = a - b
        elif op == '*':
            result = a * b
        elif op == '/':
            if b == 0:
                return jsonify({'error': "You can't divide by zero."}), 400
            result = a / b
        else:
            return jsonify({'error': 'Invalid operator'}), 400

        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/regression', methods=['POST'])
def regression():
    data = request.json
    points = data.get('points', [])
    
    if not points or len(points) < 2:
        return jsonify({'error': 'At least two points are required'}), 400

    try:
        n = len(points)
        sum_x = sum(p['x'] for p in points)
        sum_y = sum(p['y'] for p in points)
        sum_xy = sum(p['x'] * p['y'] for p in points)
        sum_x2 = sum(p['x'] ** 2 for p in points)

        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        intercept = (sum_y - slope * sum_x) / n
        x_intercept = -intercept / slope if slope != 0 else None
        y_intercept = intercept

        return jsonify({
            'slope': slope,
            'intercept': intercept,
            'xIntercept': x_intercept,
            'yIntercept': y_intercept
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
