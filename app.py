import os
import json
from flask import Flask, render_template, request, session, flash, redirect, url_for, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///sst_osint.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
# initialize the app with the extension, flask-sqlalchemy >= 3.0.x
db.init_app(app)

# Import the analysis engine
from sst_osint.fde import FieldDistortionEngine
from sst_osint.utils.text_processing import preprocess_text, segment_text

# Initialize the Field Distortion Engine
fde = None
try:
    fde = FieldDistortionEngine(use_gpu=False)
    logger.info("Field Distortion Engine initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Field Distortion Engine: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['GET', 'POST'])
def analyze():
    if request.method == 'POST':
        if not fde:
            flash("Field Distortion Engine is not available at the moment.", "error")
            return redirect(url_for('index'))
        
        text = request.form.get('text', '')
        if not text:
            flash("Please enter some text to analyze.", "error")
            return redirect(url_for('index'))
        
        try:
            # Analyze the text
            results = fde.analyze(text)
            
            # Store in session for the display page
            session['analysis_results'] = results
            session['analyzed_text'] = text
            
            return redirect(url_for('results'))
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            flash(f"An error occurred during analysis: {str(e)}", "error")
            return redirect(url_for('index'))
    
    return render_template('analyze.html')

@app.route('/results')
def results():
    results = session.get('analysis_results')
    text = session.get('analyzed_text', '')
    
    if not results:
        flash("No analysis results found. Please analyze some text first.", "warning")
        return redirect(url_for('analyze'))
    
    return render_template('results.html', results=results, text=text)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

# New pages based on provided content
@app.route('/shadow-systems-theory')
def shadow_systems_theory():
    return render_template('shadow_systems_theory.html')

@app.route('/equation')
def equation():
    return render_template('equation.html')

@app.route('/symbolic-drift')
def symbolic_drift():
    return render_template('symbolic_drift.html')

@app.route('/shadow-constant-labs')
def shadow_constant_labs():
    return render_template('shadow_constant_labs.html')

@app.route('/simulation-lab')
def simulation_lab():
    return render_template('simulation_lab.html')

@app.route('/analyst-manual')
def analyst_manual():
    return render_template('analyst_manual.html')

@app.route('/intelligence-applications')
def intelligence_applications():
    return render_template('intelligence_applications.html')

@app.route('/trafficking-detection')
def trafficking_detection():
    return render_template('trafficking_detection.html')

# Outreach and Support pages
@app.route('/outreach-support')
def outreach_support():
    return render_template('outreach_support.html')

@app.route('/volunteer')
def volunteer():
    return render_template('volunteer.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/founder')
def founder():
    return render_template('founder.html')

# Visualization routes
@app.route('/visualizations')
def visualizations():
    """Main visualizations page with examples and documentation"""
    return render_template('visualizations.html')

@app.route('/api/analysis/<analysis_id>')
def get_analysis_data(analysis_id):
    """API endpoint to fetch analysis data for visualizations"""
    # For now, we'll use the sample data
    # In production, this would fetch from a database
    try:
        if analysis_id == 'sample':
            with open('static/data/sample-analysis.json', 'r') as f:
                data = json.load(f)
            return jsonify(data)
        else:
            # Try to look up in database
            from models import Analysis
            analysis = Analysis.query.get(analysis_id)
            if analysis:
                # Convert database model to visualization JSON format
                data = {
                    "id": analysis.id,
                    "created_at": analysis.created_at.isoformat(),
                    "field_classification": analysis.field_classification or "Uncategorized",
                    "total_segments": analysis.num_segments,
                    "summary": analysis.summary,
                    # This is simplified - in a real app we'd have segment data
                    "segments": []
                }
                return jsonify(data)
        
        return jsonify({"error": "Analysis not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching analysis data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/visualize/<analysis_id>')
def visualize_analysis(analysis_id):
    """Page to visualize a specific analysis"""
    # For now, we'll just pass the ID and let JavaScript load the data
    return render_template('visualize.html', analysis_id=analysis_id)

# Static data routes only

# Static data for development/testing
@app.route('/static/data/<path:filename>')
def serve_data(filename):
    """Serve JSON data files from the static/data directory"""
    return send_from_directory('static/data', filename)

# Create database tables
with app.app_context():
    # Import models
    from models import Analysis  # noqa: F401
    
    # Create tables
    db.create_all()

# Run the app if executed directly
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)