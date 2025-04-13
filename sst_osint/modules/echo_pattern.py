"""
Echo Pattern Engine (EPE) Module

This module detects repeated phrases that appear contextually distorted and tracks
grooming loops, obedience reinforcement, or false memory cues.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
import spacy
import logging
from collections import Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger(__name__)

class EchoPatternEngine:
    """
    Echo Pattern Engine (EPE) class for detecting repeated phrases.
    """
    
    def __init__(self, nlp: spacy.language.Language):
        """
        Initialize the Echo Pattern Engine.
        
        Args:
            nlp: spaCy language model
        """
        self.nlp = nlp
        logger.info("Echo Pattern Engine initialized")
    
    def analyze(self, docs: List[spacy.tokens.Doc]) -> Dict[str, Any]:
        """
        Analyze documents for echo patterns.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            Dictionary containing analysis results
        """
        if not docs:
            logger.warning("No documents provided for analysis.")
            return {
                "echo_patterns": [],
                "echo_count": 0,
                "mean_intensity": 0.0,
                "top_echoes": [],
                "echo_intensity": []
            }
        
        # Extract n-grams from each document
        all_text = " ".join([doc.text for doc in docs])
        ngrams = self._extract_ngrams(all_text)
        
        # Find echoes (repeated phrases)
        echoes = self._find_echoes(ngrams, docs)
        
        # Extract echo patterns (phrases that appear in multiple contexts)
        echo_patterns = self._extract_echo_patterns(echoes, docs)
        
        # Calculate echo intensity for each segment
        echo_intensity = self._calculate_echo_intensity(echo_patterns, docs)
        
        # Sort echoes by intensity (highest first)
        top_echoes = [(echo["phrase"], echo["intensity"]) 
                     for echo in echo_patterns]
        top_echoes.sort(key=lambda x: x[1], reverse=True)
        
        # Calculate statistics
        echo_count = len(echo_patterns)
        mean_intensity = np.mean([echo["intensity"] for echo in echo_patterns]) if echo_patterns else 0.0
        
        return {
            "echo_patterns": echo_patterns,
            "echo_count": echo_count,
            "mean_intensity": float(mean_intensity),
            "top_echoes": top_echoes[:10],  # Top 10 echoes
            "echo_intensity": echo_intensity
        }
    
    def _extract_ngrams(self, text: str, min_n: int = 3, max_n: int = 8) -> List[Tuple[str, int]]:
        """
        Extract n-grams from text.
        
        Args:
            text: Input text
            min_n: Minimum n-gram length (in words)
            max_n: Maximum n-gram length (in words)
            
        Returns:
            List of tuples (n-gram, count)
        """
        words = text.split()
        if len(words) < min_n:
            return []
        
        ngram_counter = Counter()
        
        # Extract n-grams of different lengths
        for n in range(min_n, min(max_n + 1, len(words) + 1)):
            ngrams = [' '.join(words[i:i+n]) for i in range(len(words) - n + 1)]
            ngram_counter.update(ngrams)
        
        # Filter out n-grams that appear only once
        return [(ngram, count) for ngram, count in ngram_counter.items() if count > 1]
    
    def _find_echoes(self, ngrams: List[Tuple[str, int]], docs: List[spacy.tokens.Doc]) -> List[Dict[str, Any]]:
        """
        Find echoes (repeated phrases) in documents.
        
        Args:
            ngrams: List of n-grams and their counts
            docs: List of spaCy Doc objects
            
        Returns:
            List of echo dictionaries
        """
        echoes = []
        
        for ngram, count in ngrams:
            # Skip n-grams that appear too infrequently
            if count < 2:
                continue
            
            # Find all occurrences of this n-gram
            occurrences = []
            for i, doc in enumerate(docs):
                text = doc.text
                # Find all occurrences in this document
                for match in re.finditer(re.escape(ngram), text):
                    occurrences.append({
                        "segment_index": i,
                        "start": match.start(),
                        "end": match.end(),
                        "context": self._extract_context(text, match.start(), match.end())
                    })
            
            # If we found multiple occurrences, add to echoes
            if len(occurrences) >= 2:
                echoes.append({
                    "phrase": ngram,
                    "count": count,
                    "occurrences": occurrences
                })
        
        # Sort by count (most frequent first)
        echoes.sort(key=lambda x: x["count"], reverse=True)
        
        return echoes
    
    def _extract_context(self, text: str, start: int, end: int, context_size: int = 50) -> str:
        """
        Extract context around a phrase.
        
        Args:
            text: Input text
            start: Start index of the phrase
            end: End index of the phrase
            context_size: Number of characters to include before and after
            
        Returns:
            Context string
        """
        context_start = max(0, start - context_size)
        context_end = min(len(text), end + context_size)
        
        before = text[context_start:start]
        phrase = text[start:end]
        after = text[end:context_end]
        
        return f"{before}[{phrase}]{after}"
    
    def _extract_echo_patterns(self, echoes: List[Dict[str, Any]], docs: List[spacy.tokens.Doc]) -> List[Dict[str, Any]]:
        """
        Extract echo patterns (phrases that appear in different contexts).
        
        Args:
            echoes: List of echo dictionaries
            docs: List of spaCy Doc objects
            
        Returns:
            List of echo pattern dictionaries
        """
        echo_patterns = []
        
        for echo in echoes:
            # Skip echoes with too few occurrences
            if len(echo["occurrences"]) < 2:
                continue
            
            # Calculate context similarity for each pair of occurrences
            context_similarities = []
            for i in range(len(echo["occurrences"])):
                for j in range(i+1, len(echo["occurrences"])):
                    context_i = echo["occurrences"][i]["context"]
                    context_j = echo["occurrences"][j]["context"]
                    
                    # Calculate similarity between contexts
                    similarity = self._calculate_context_similarity(context_i, context_j)
                    context_similarities.append(similarity)
            
            # Calculate mean context similarity
            mean_similarity = np.mean(context_similarities) if context_similarities else 1.0
            
            # Calculate echo intensity (higher for phrases in different contexts)
            intensity = echo["count"] * (1.0 - mean_similarity)
            
            # Identify context shifts
            context_shifts = []
            if len(echo["occurrences"]) >= 2:
                for i in range(len(echo["occurrences"]) - 1):
                    curr_context = echo["occurrences"][i]["context"]
                    next_context = echo["occurrences"][i+1]["context"]
                    
                    similarity = self._calculate_context_similarity(curr_context, next_context)
                    if similarity < 0.5:  # Threshold for context shift
                        context_shifts.append({
                            "from_segment": echo["occurrences"][i]["segment_index"],
                            "to_segment": echo["occurrences"][i+1]["segment_index"],
                            "similarity": similarity
                        })
            
            # Add to echo patterns if intensity is significant
            if intensity > 0.1:  # Threshold can be adjusted
                echo_patterns.append({
                    "phrase": echo["phrase"],
                    "count": echo["count"],
                    "mean_context_similarity": float(mean_similarity),
                    "intensity": float(intensity),
                    "context_shifts": context_shifts,
                    "occurrences": echo["occurrences"]
                })
        
        # Sort by intensity (highest first)
        echo_patterns.sort(key=lambda x: x["intensity"], reverse=True)
        
        return echo_patterns
    
    def _calculate_context_similarity(self, context1: str, context2: str) -> float:
        """
        Calculate similarity between two contexts.
        
        Args:
            context1: First context
            context2: Second context
            
        Returns:
            Similarity value (0.0 = completely different, 1.0 = identical)
        """
        # Simple approach using TF-IDF and cosine similarity
        vectorizer = TfidfVectorizer()
        
        try:
            tfidf_matrix = vectorizer.fit_transform([context1, context2])
            similarity = (tfidf_matrix * tfidf_matrix.T).A[0, 1]
        except:
            # Fallback if vectorizer fails
            similarity = 0.5
        
        return float(similarity)
    
    def _calculate_echo_intensity(self, echo_patterns: List[Dict[str, Any]], 
                                docs: List[spacy.tokens.Doc]) -> List[float]:
        """
        Calculate echo intensity for each segment.
        
        Args:
            echo_patterns: List of echo pattern dictionaries
            docs: List of spaCy Doc objects
            
        Returns:
            List of echo intensity values for each segment
        """
        # Initialize intensity values for each segment
        intensity_values = [0.0] * len(docs)
        
        for pattern in echo_patterns:
            # For each occurrence, add the pattern intensity to the segment
            for occurrence in pattern["occurrences"]:
                segment_index = occurrence["segment_index"]
                if 0 <= segment_index < len(intensity_values):
                    intensity_values[segment_index] += pattern["intensity"]
        
        # Normalize by the number of tokens in each segment
        for i, doc in enumerate(docs):
            num_tokens = len([token for token in doc if not token.is_punct and not token.is_space])
            if num_tokens > 0:
                intensity_values[i] /= num_tokens
        
        return intensity_values
