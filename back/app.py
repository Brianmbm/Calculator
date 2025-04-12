from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)
