from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from predictor import AdvancedStockPredictor
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

predictor = AdvancedStockPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'VSM ML Prediction',
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symbol = data.get('symbol', '').upper()
        days = int(data.get('days', 7))
        
        if not symbol:
            return jsonify({'success': False, 'error': 'Symbol required'}), 400
        
        if days < 1 or days > 30:
            return jsonify({'success': False, 'error': 'Days: 1-30'}), 400
        
        logger.info(f"🔮 Predicting {symbol} for {days} days")
        
        result = predictor.predict(symbol, days)
        
        if not result.get('success'):
            return jsonify(result), 400
        
        logger.info(f"✅ Success: {symbol} -> ₹{result['summary']['predicted_price']}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"🚀 Starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
