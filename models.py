from app import db
from datetime import datetime

class Analysis(db.Model):
    """Model to store analysis results from the Field Distortion Engine."""
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    text = db.Column(db.Text, nullable=False)
    field_classification = db.Column(db.String(50), nullable=True)
    entropy_score = db.Column(db.Float, nullable=False)
    fractal_recursion_score = db.Column(db.Float, nullable=False)
    symbol_density = db.Column(db.Float, nullable=False)
    echo_intensity = db.Column(db.Float, nullable=False)
    num_segments = db.Column(db.Integer, nullable=False)
    summary = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Analysis {self.id}: {self.field_classification or "No classification"}>'