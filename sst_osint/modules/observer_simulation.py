"""
Observer Simulation Layer (OSL) Module

This module inserts analyst persona into input stream to test resonance response
and simulates "observer interference" for feedback loop modeling.
"""

import numpy as np
from typing import List, Dict, Any
import spacy
import logging
import random

logger = logging.getLogger(__name__)

class ObserverSimulationLayer:
    """
    Observer Simulation Layer (OSL) class for simulating resonance response.
    """
    
    def __init__(self, nlp: spacy.language.Language):
        """
        Initialize the Observer Simulation Layer.
        
        Args:
            nlp: spaCy language model
        """
        self.nlp = nlp
        
        # Define analyst personas
        self._initialize_personas()
        
        # Initialize sentiment analysis (simplified version)
        self.has_sentiment = False
        logger.warning("Sentiment analysis disabled: transformers library not available")
        
        logger.info("Observer Simulation Layer initialized")
    
    def _initialize_personas(self):
        """Initialize analyst personas for simulation."""
        self.personas = [
            {
                "name": "Clinical_Objective",
                "description": "A clinical, objective observer who focuses on facts and avoids emotional language.",
                "style": "clinical",
                "questions": [
                    "What specific language patterns are evident in this text?",
                    "How does the narrative structure change throughout the text?",
                    "What factual inconsistencies appear in the account?",
                    "What is the frequency of first-person vs. third-person references?",
                    "How does the terminology evolve through different segments?"
                ]
            },
            {
                "name": "Empathetic_Supporter",
                "description": "An empathetic observer who responds with emotional support and validation.",
                "style": "empathetic",
                "questions": [
                    "How might the emotional state of the author shift throughout the text?",
                    "What unsaid emotions seem to underlie the narrative?",
                    "Where does the text show signs of emotional processing or blockage?",
                    "How might the author be seeking validation or support?",
                    "What emotional responses might this text evoke in different readers?"
                ]
            },
            {
                "name": "Skeptical_Analyst",
                "description": "A skeptical observer who questions assertions and looks for logical fallacies.",
                "style": "skeptical",
                "questions": [
                    "What claims in this text lack sufficient evidence?",
                    "How might confirmation bias be operating in this narrative?",
                    "What alternative explanations exist for the described events?",
                    "Where does the reasoning show signs of circular logic?",
                    "What unstated assumptions underlie the main assertions?"
                ]
            }
        ]
    
    def analyze(self, docs: List[spacy.tokens.Doc]) -> Dict[str, Any]:
        """
        Analyze documents by simulating different observer perspectives.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            Dictionary containing analysis results
        """
        if not docs:
            logger.warning("No documents provided for analysis.")
            return {
                "observer_responses": [],
                "resonance_scores": {},
                "feedback_loops": [],
                "sentiment_shifts": []
            }
        
        # For each persona, simulate responses to the text
        observer_responses = []
        
        for persona in self.personas:
            responses = self._simulate_persona_response(docs, persona)
            observer_responses.append({
                "persona": persona["name"],
                "responses": responses
            })
        
        # Calculate resonance scores for each persona
        resonance_scores = self._calculate_resonance_scores(docs, observer_responses)
        
        # Detect potential feedback loops
        feedback_loops = self._detect_feedback_loops(docs, observer_responses)
        
        # Analyze sentiment shifts
        sentiment_shifts = self._analyze_sentiment_shifts(docs)
        
        return {
            "observer_responses": observer_responses,
            "resonance_scores": resonance_scores,
            "feedback_loops": feedback_loops,
            "sentiment_shifts": sentiment_shifts
        }
    
    def _simulate_persona_response(self, docs: List[spacy.tokens.Doc], 
                                 persona: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Simulate responses from a specific persona.
        
        Args:
            docs: List of spaCy Doc objects
            persona: Persona information
            
        Returns:
            List of simulated responses
        """
        responses = []
        
        # Select segments to respond to (not every segment gets a response)
        num_segments = len(docs)
        response_indices = sorted(random.sample(range(num_segments), 
                                              min(3, num_segments)))
        
        for i in response_indices:
            # Select a question appropriate for this segment
            question = random.choice(persona["questions"])
            
            # Simulate resonance analysis
            resonance = self._analyze_resonance(docs[i], persona)
            
            responses.append({
                "segment_index": i,
                "question": question,
                "resonance": resonance
            })
        
        return responses
    
    def _analyze_resonance(self, doc: spacy.tokens.Doc, persona: Dict[str, Any]) -> Dict[str, float]:
        """
        Analyze resonance between a document and a persona.
        
        Args:
            doc: spaCy Doc object
            persona: Persona information
            
        Returns:
            Dictionary of resonance scores
        """
        # This is a simplified simulation - in a real system, this would involve
        # more sophisticated NLP techniques
        
        # Extract key features from the document
        emotionality = self._calculate_emotionality(doc)
        factuality = self._calculate_factuality(doc)
        ambiguity = self._calculate_ambiguity(doc)
        
        # Calculate resonance based on persona style
        if persona["style"] == "clinical":
            alignment = (1.0 - emotionality) * 0.5 + factuality * 0.5
            tension = emotionality * 0.7 + ambiguity * 0.3
        
        elif persona["style"] == "empathetic":
            alignment = emotionality * 0.7 + (1.0 - factuality) * 0.3
            tension = (1.0 - emotionality) * 0.5 + factuality * 0.5
        
        else:  # skeptical
            alignment = factuality * 0.3 + ambiguity * 0.7
            tension = (1.0 - factuality) * 0.5 + (1.0 - ambiguity) * 0.5
        
        # Calculate overall resonance
        resonance = alignment - tension
        
        return {
            "alignment": float(alignment),
            "tension": float(tension),
            "resonance": float(resonance),
            "emotionality": float(emotionality),
            "factuality": float(factuality),
            "ambiguity": float(ambiguity)
        }
    
    def _calculate_emotionality(self, doc: spacy.tokens.Doc) -> float:
        """
        Calculate emotionality of a document.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            Emotionality score (0.0-1.0)
        """
        # Count emotional words
        emotional_words = ["love", "hate", "fear", "angry", "sad", "happy", "worry", 
                          "scared", "anxious", "excited", "terrible", "wonderful", 
                          "awful", "amazing", "horrific", "beautiful", "ugly"]
        
        count = 0
        for token in doc:
            if token.lemma_.lower() in emotional_words:
                count += 1
        
        # Calculate emotionality as proportion of emotional words
        emotionality = count / max(1, len(doc))
        
        # Scale to reasonable range
        emotionality = min(1.0, emotionality * 5.0)
        
        return emotionality
    
    def _calculate_factuality(self, doc: spacy.tokens.Doc) -> float:
        """
        Calculate factuality of a document.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            Factuality score (0.0-1.0)
        """
        # Count factual indicators and opinion indicators
        factual_indicators = ["fact", "evidence", "data", "research", "study", 
                             "statistic", "measured", "observed", "documented"]
        
        opinion_indicators = ["think", "believe", "feel", "sense", "seems", 
                             "appears", "might", "could", "perhaps", "maybe"]
        
        factual_count = 0
        opinion_count = 0
        
        for token in doc:
            if token.lemma_.lower() in factual_indicators:
                factual_count += 1
            elif token.lemma_.lower() in opinion_indicators:
                opinion_count += 1
        
        # Calculate factuality ratio
        total = factual_count + opinion_count
        if total == 0:
            return 0.5  # Neutral if no indicators
        
        factuality = factual_count / total
        
        return factuality
    
    def _calculate_ambiguity(self, doc: spacy.tokens.Doc) -> float:
        """
        Calculate ambiguity of a document.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            Ambiguity score (0.0-1.0)
        """
        # Count ambiguity markers
        ambiguity_markers = ["maybe", "perhaps", "possibly", "might", "could", 
                            "uncertain", "unclear", "unknown", "somewhat", 
                            "somehow", "sort of", "kind of", "approximately"]
        
        certainty_markers = ["definitely", "certainly", "absolutely", "clearly", 
                            "obviously", "undoubtedly", "precisely", "exactly", 
                            "surely", "indeed", "without doubt"]
        
        ambiguity_count = 0
        certainty_count = 0
        
        for token in doc:
            if token.lemma_.lower() in ambiguity_markers:
                ambiguity_count += 1
            elif token.lemma_.lower() in certainty_markers:
                certainty_count += 1
        
        # Look for bigrams
        for i in range(len(doc) - 1):
            bigram = doc[i].text.lower() + " " + doc[i+1].text.lower()
            if bigram in ["sort of", "kind of"]:
                ambiguity_count += 1
        
        # Calculate ambiguity score
        total = ambiguity_count + certainty_count
        if total == 0:
            return 0.5  # Neutral if no markers
        
        ambiguity = ambiguity_count / total
        
        return ambiguity
    
    def _calculate_resonance_scores(self, docs: List[spacy.tokens.Doc], 
                                   observer_responses: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate overall resonance scores for each persona.
        
        Args:
            docs: List of spaCy Doc objects
            observer_responses: List of observer response dictionaries
            
        Returns:
            Dictionary of resonance scores
        """
        resonance_scores = {}
        
        for response in observer_responses:
            persona_name = response["persona"]
            persona_responses = response["responses"]
            
            # Calculate average resonance for this persona
            if persona_responses:
                avg_resonance = np.mean([r["resonance"]["resonance"] for r in persona_responses])
                resonance_scores[persona_name] = float(avg_resonance)
            else:
                resonance_scores[persona_name] = 0.0
        
        return resonance_scores
    
    def _detect_feedback_loops(self, docs: List[spacy.tokens.Doc], 
                             observer_responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect potential feedback loops in the narrative.
        
        Args:
            docs: List of spaCy Doc objects
            observer_responses: List of observer response dictionaries
            
        Returns:
            List of detected feedback loops
        """
        feedback_loops = []
        
        # Simple detection based on resonance patterns
        for response in observer_responses:
            persona_name = response["persona"]
            persona_responses = response["responses"]
            
            # Skip if too few responses
            if len(persona_responses) < 2:
                continue
            
            # Look for patterns of increasing resonance
            resonance_values = [r["resonance"]["resonance"] for r in persona_responses]
            increases = [resonance_values[i] > resonance_values[i-1] 
                        for i in range(1, len(resonance_values))]
            
            # If we see consistent increases in resonance, flag as potential feedback loop
            if all(increases) and len(increases) >= 2:
                feedback_loops.append({
                    "persona": persona_name,
                    "segments": [r["segment_index"] for r in persona_responses],
                    "resonance_trend": resonance_values,
                    "strength": float(resonance_values[-1] - resonance_values[0])
                })
        
        return feedback_loops
    
    def _analyze_sentiment_shifts(self, docs: List[spacy.tokens.Doc]) -> List[Dict[str, Any]]:
        """
        Analyze sentiment shifts across documents.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            List of sentiment shifts
        """
        sentiment_shifts = []
        
        # Skip if we don't have the sentiment pipeline
        if not self.has_sentiment or len(docs) < 2:
            return sentiment_shifts
        
        try:
            # Calculate sentiment for each segment
            sentiments = []
            for doc in docs:
                result = self.sentiment_pipeline(doc.text[:512])  # Truncate for pipeline
                if result:
                    label = result[0]["label"]
                    score = result[0]["score"]
                    
                    # Convert to numeric score (-1 to 1)
                    if label.lower() == "positive":
                        numeric_score = score
                    elif label.lower() == "negative":
                        numeric_score = -score
                    else:
                        numeric_score = 0.0
                    
                    sentiments.append(numeric_score)
                else:
                    sentiments.append(0.0)
            
            # Detect significant shifts
            for i in range(1, len(sentiments)):
                shift = sentiments[i] - sentiments[i-1]
                
                # If shift is significant
                if abs(shift) > 0.5:
                    direction = "positive" if shift > 0 else "negative"
                    sentiment_shifts.append({
                        "from_segment": i-1,
                        "to_segment": i,
                        "direction": direction,
                        "magnitude": abs(shift)
                    })
        
        except Exception as e:
            logger.error(f"Error analyzing sentiment shifts: {e}")
        
        return sentiment_shifts
