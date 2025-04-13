"""
Fractal Drift Detector (FDD) Module

This module detects recursion and metaphor reuse and compares narrative shape across inputs.
"""

import numpy as np
from typing import List, Dict, Any
import spacy
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class FractalDriftDetector:
    """
    Fractal Drift Detector (FDD) class for detecting recursion and metaphor reuse.
    """
    
    def __init__(self, nlp: spacy.language.Language):
        """
        Initialize the Fractal Drift Detector.
        
        Args:
            nlp: spaCy language model
        """
        self.nlp = nlp
        self.vectorizer = TfidfVectorizer(
            min_df=1, max_df=0.9, 
            stop_words='english', 
            ngram_range=(1, 3)
        )
        
        # Metaphor indicators (words that often signal metaphorical language)
        self.metaphor_indicators = [
            "like", "as", "than", "seems", "appears", "resembles", 
            "reflects", "echoes", "mirrors", "symbolizes", "represents"
        ]
        
        logger.info("Fractal Drift Detector initialized")
    
    def analyze(self, docs: List[spacy.tokens.Doc]) -> Dict[str, Any]:
        """
        Analyze documents for fractal patterns and narrative drift.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            Dictionary containing analysis results
        """
        if not docs:
            logger.warning("No documents provided for analysis.")
            return {
                "drift_vectors": [],
                "fractal_signatures": [],
                "metaphor_clusters": [],
                "recursion_score": 0.0,
                "narrative_stability": 0.0
            }
        
        # Extract text from docs
        texts = [doc.text for doc in docs]
        
        # Calculate TF-IDF vectors
        try:
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            feature_names = np.array(self.vectorizer.get_feature_names_out())
        except ValueError as e:
            logger.error(f"Error calculating TF-IDF: {e}")
            return {
                "error": str(e),
                "drift_vectors": [],
                "fractal_signatures": [],
                "metaphor_clusters": [],
                "recursion_score": 0.0,
                "narrative_stability": 0.0
            }
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(tfidf_matrix)
        
        # Calculate drift vectors (how each segment differs from the previous)
        drift_vectors = []
        for i in range(1, len(docs)):
            # Get the TF-IDF vectors for consecutive segments
            prev_vec = tfidf_matrix[i-1].toarray().flatten()
            curr_vec = tfidf_matrix[i].toarray().flatten()
            
            # Calculate the drift vector (difference between vectors)
            drift = curr_vec - prev_vec
            
            # Find the most significant terms (positive and negative drift)
            pos_drift_indices = np.argsort(drift)[-5:]  # Top 5 positive drifts
            neg_drift_indices = np.argsort(drift)[:5]   # Top 5 negative drifts
            
            pos_drift_terms = [(feature_names[idx], drift[idx]) for idx in pos_drift_indices if drift[idx] > 0]
            neg_drift_terms = [(feature_names[idx], drift[idx]) for idx in neg_drift_indices if drift[idx] < 0]
            
            drift_vectors.append({
                "segment_index": i,
                "positive_drift": pos_drift_terms,
                "negative_drift": neg_drift_terms,
                "drift_magnitude": np.linalg.norm(drift)
            })
        
        # Detect metaphors and figurative language
        metaphor_clusters = self._detect_metaphors(docs)
        
        # Calculate fractal signatures (recurring patterns)
        fractal_signatures = self._calculate_fractal_signatures(docs, similarity_matrix)
        
        # Calculate recursion score
        recursion_score = self._calculate_recursion_score(similarity_matrix)
        
        # Calculate narrative stability
        narrative_stability = 1.0 - (sum(d["drift_magnitude"] for d in drift_vectors) / 
                                    max(1, len(drift_vectors)))
        
        return {
            "drift_vectors": drift_vectors,
            "fractal_signatures": fractal_signatures,
            "metaphor_clusters": metaphor_clusters,
            "recursion_score": recursion_score,
            "narrative_stability": narrative_stability
        }
    
    def _detect_metaphors(self, docs: List[spacy.tokens.Doc]) -> List[Dict[str, Any]]:
        """
        Detect metaphors and figurative language in documents.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            List of metaphor clusters
        """
        metaphor_clusters = []
        
        for i, doc in enumerate(docs):
            # Look for sentences with metaphor indicators
            metaphors = []
            
            for sent in doc.sents:
                # Check if sentence contains metaphor indicators
                if any(token.text.lower() in self.metaphor_indicators for token in sent):
                    # Extract the sentence and identify the metaphor components
                    metaphor_text = sent.text
                    
                    # Find the root verb and its dependencies
                    root = None
                    for token in sent:
                        if token.dep_ == "ROOT":
                            root = token
                            break
                    
                    if root:
                        # Extract source and target domains of the metaphor
                        source_domain = []
                        target_domain = []
                        
                        for token in sent:
                            # Basic heuristic for metaphor components
                            if token.dep_ in ["nsubj", "nsubjpass"] and token.head == root:
                                target_domain.append(token.text)
                            elif token.dep_ in ["dobj", "pobj", "attr"] and token.head == root:
                                source_domain.append(token.text)
                        
                        metaphors.append({
                            "text": metaphor_text,
                            "source_domain": " ".join(source_domain),
                            "target_domain": " ".join(target_domain),
                            "indicator": next((t.text for t in sent 
                                             if t.text.lower() in self.metaphor_indicators), "")
                        })
            
            if metaphors:
                metaphor_clusters.append({
                    "segment_index": i,
                    "metaphors": metaphors,
                    "count": len(metaphors)
                })
        
        return metaphor_clusters
    
    def _calculate_fractal_signatures(self, 
                                     docs: List[spacy.tokens.Doc], 
                                     similarity_matrix: np.ndarray) -> List[Dict[str, Any]]:
        """
        Calculate fractal signatures (recurring patterns) in the documents.
        
        Args:
            docs: List of spaCy Doc objects
            similarity_matrix: Similarity matrix between documents
            
        Returns:
            List of fractal signatures
        """
        fractal_signatures = []
        
        # Find significant recurring patterns (high similarity between non-adjacent segments)
        for i in range(len(docs)):
            for j in range(i+2, len(docs)):  # Skip adjacent segments
                similarity = similarity_matrix[i, j]
                
                # If similarity is high (threshold can be adjusted)
                if similarity > 0.3:
                    # Extract common terms between the segments
                    doc_i_text = docs[i].text.lower()
                    doc_j_text = docs[j].text.lower()
                    
                    # Find common phrases (simple approach using n-grams)
                    common_phrases = self._find_common_phrases(doc_i_text, doc_j_text)
                    
                    if common_phrases:
                        fractal_signatures.append({
                            "segment_pair": (i, j),
                            "similarity": float(similarity),
                            "common_phrases": common_phrases[:5],  # Top 5 common phrases
                            "distance": j - i
                        })
        
        # Sort by similarity (highest first)
        fractal_signatures.sort(key=lambda x: x["similarity"], reverse=True)
        
        return fractal_signatures
    
    def _find_common_phrases(self, text1: str, text2: str, min_length: int = 4) -> List[str]:
        """
        Find common phrases between two texts.
        
        Args:
            text1: First text
            text2: Second text
            min_length: Minimum length of phrases to consider
            
        Returns:
            List of common phrases
        """
        words1 = text1.split()
        words2 = text2.split()
        
        common_phrases = []
        
        # Check for common n-grams
        for n in range(min_length, min(10, min(len(words1), len(words2)) + 1)):
            ngrams1 = [' '.join(words1[i:i+n]) for i in range(len(words1) - n + 1)]
            ngrams2 = [' '.join(words2[i:i+n]) for i in range(len(words2) - n + 1)]
            
            # Find intersection
            common = set(ngrams1).intersection(set(ngrams2))
            common_phrases.extend(list(common))
        
        return common_phrases
    
    def _calculate_recursion_score(self, similarity_matrix: np.ndarray) -> float:
        """
        Calculate recursion score based on the similarity matrix.
        
        High recursion score indicates repeating narrative patterns.
        
        Args:
            similarity_matrix: Similarity matrix between documents
            
        Returns:
            Recursion score
        """
        # Calculate average non-adjacent similarity
        n = similarity_matrix.shape[0]
        if n <= 2:
            return 0.0
        
        non_adjacent_similarities = []
        for i in range(n):
            for j in range(n):
                if abs(i - j) >= 2:  # Non-adjacent segments
                    non_adjacent_similarities.append(similarity_matrix[i, j])
        
        # Calculate recursion score as average non-adjacent similarity
        recursion_score = np.mean(non_adjacent_similarities) if non_adjacent_similarities else 0.0
        
        return float(recursion_score)
