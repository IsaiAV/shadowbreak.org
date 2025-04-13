"""
Field Distortion Engine (FDE) - Core Module

This module implements the main FDE class which orchestrates the analysis of text data
using various detection modules and produces visualizations of the results.
"""

import os
import logging
import spacy
import numpy as np
from pathlib import Path
from typing import Dict, List, Union, Tuple, Optional

# Import modules
from .modules.fractal_drift import FractalDriftDetector
from .modules.narrative_entropy import NarrativeEntropyScanner
from .modules.symbolic_density import SymbolicDensityAnalyzer
from .modules.echo_pattern import EchoPatternEngine
from .modules.observer_simulation import ObserverSimulationLayer
from .utils.visualization import plot_entropy_heatmap, plot_drift_diagram, plot_fractal_signatures
from .utils.text_processing import preprocess_text, segment_text

logger = logging.getLogger(__name__)

class FieldDistortionEngine:
    """
    Field Distortion Engine (FDE) for analyzing text data.
    
    The FDE integrates multiple analysis modules to detect narrative drift,
    metaphor patterns, and emotional distortion in language.
    """
    
    def __init__(self, use_gpu: bool = False):
        """
        Initialize the Field Distortion Engine.
        
        Args:
            use_gpu: Whether to use GPU acceleration if available.
        """
        logger.info("Initializing Field Distortion Engine...")
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model: en_core_web_sm")
        except OSError:
            logger.warning("Could not load en_core_web_sm. Installing...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Initialize modules
        self.fdd = FractalDriftDetector(self.nlp)
        self.nes = NarrativeEntropyScanner(self.nlp)
        self.sda = SymbolicDensityAnalyzer(self.nlp)
        self.epe = EchoPatternEngine(self.nlp)
        self.osl = ObserverSimulationLayer(self.nlp)
        
        logger.info("Field Distortion Engine initialized.")
    
    def analyze(self, text: str, output_dir: Optional[str] = None) -> Dict:
        """
        Analyze a text input using all FDE modules.
        
        Args:
            text: Text to analyze
            output_dir: Directory to save visualization outputs
            
        Returns:
            Dictionary containing analysis results
        """
        logger.info("Starting analysis...")
        
        # Preprocess and segment the text
        preprocessed_text = preprocess_text(text)
        segments = segment_text(preprocessed_text)
        
        if len(segments) == 0:
            logger.error("No segments found in the text.")
            return {"error": "No segments found in the text."}
        
        # Process text with spaCy
        docs = [self.nlp(segment) for segment in segments]
        
        # Run all analyses
        fractal_results = self.fdd.analyze(docs)
        entropy_results = self.nes.analyze(docs)
        symbolic_results = self.sda.analyze(docs)
        echo_results = self.epe.analyze(docs)
        observer_results = self.osl.analyze(docs)
        
        # Field curvature calculation removed as requested
        
        # Generate visualizations if output directory is provided
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Create visualizations
            plot_entropy_heatmap(entropy_results['entropy_values'], 
                                str(output_path / "entropy_heatmap.png"))
            
            plot_drift_diagram(fractal_results['drift_vectors'], 
                              str(output_path / "drift_diagram.png"))
            
            plot_fractal_signatures(fractal_results['fractal_signatures'], 
                                  str(output_path / "fractal_signatures.png"))
        
        # Combine all results
        results = {
            "fractal_drift": fractal_results,
            "narrative_entropy": entropy_results,
            "symbolic_density": symbolic_results,
            "echo_patterns": echo_results,
            "observer_simulation": observer_results,
            "num_segments": len(segments),
            "segments": segments  # Include the segments for reference
        }
        
        logger.info("Analysis completed successfully.")
        return results
        
    def analyze_stream(self, text: str) -> Dict:
        """
        Analyze text input in real-time streaming mode.
        
        This method is optimized for quick analysis of text as it's being entered,
        using a subset of analysis modules for better performance.
        
        Args:
            text: Text to analyze (current buffer)
            
        Returns:
            Dictionary containing streamlined analysis results
        """
        logger.debug("Processing text stream...")
        
        # For streaming, we use a simplified approach:
        # 1. We don't segment the text (analyze as single unit)
        # 2. We run only a subset of analyzers for speed
        
        # Preprocess text
        preprocessed_text = preprocess_text(text)
        
        if not preprocessed_text or len(preprocessed_text) < 10:
            # Too short for meaningful analysis
            return {
                "status": "insufficient_data",
                "message": "Need more text for analysis",
                "metrics": {
                    "entropy": 0.0,
                    "symbolic_density": 0.0,
                    "sentiment": 0.0
                }
            }
        
        # Process with spaCy
        doc = self.nlp(preprocessed_text)
        docs = [doc]  # List with single document for module compatibility
        
        # Run lightweight analyses
        # Use full module analysis but extract just what we need
        entropy_results = self.nes.analyze(docs)
        entropy_score = entropy_results['mean_entropy']
        
        symbolic_results = self.sda.analyze(docs)
        symbol_density = symbolic_results['mean_density']
        
        # Use Observer Simulation Layer for sentiment
        sentiment = 0.0
        try:
            # Only run sentiment if text is substantial
            if len(preprocessed_text) > 30:
                observer_results = self.osl.analyze(docs)
                sentiment = observer_results.get('emotional_response', 0.0)
        except Exception as e:
            logger.warning(f"Error in sentiment analysis: {e}")
        
        # Simplified metrics for speed
        metrics = {
            "entropy": entropy_score,
            "symbolic_density": symbol_density,
            "sentiment": sentiment,
            "text_length": len(preprocessed_text),
            "word_count": len(doc)
        }
        
        # Add complexity metrics
        metrics["entropy_score"] = (entropy_score * 0.5) + (symbol_density * 0.3) + (abs(sentiment) * 0.2)
        
        # Classification based on metrics
        classification = "Stable Field"
        if metrics["entropy_score"] > 0.7:
            classification = "Collapsed Field"
        elif metrics["entropy_score"] > 0.4:
            classification = "Distorted Field"
        
        # Get current timestamp
        import datetime
        
        results = {
            "status": "success",
            "metrics": metrics,
            "classification": classification,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        return results
    
    # Field curvature methods removed as requested
