"""
Narrative Entropy Scanner (NES) Module

This module measures semantic entropy (disorder) over time. High entropy may signal
narrative trauma zones or emotional collapse.
"""

import numpy as np
from typing import List, Dict, Any
import spacy
import logging
from scipy.stats import entropy
from collections import Counter

logger = logging.getLogger(__name__)

class NarrativeEntropyScanner:
    """
    Narrative Entropy Scanner (NES) class for measuring semantic entropy.
    """
    
    def __init__(self, nlp: spacy.language.Language):
        """
        Initialize the Narrative Entropy Scanner.
        
        Args:
            nlp: spaCy language model
        """
        self.nlp = nlp
        logger.info("Narrative Entropy Scanner initialized")
    
    def analyze(self, docs: List[spacy.tokens.Doc]) -> Dict[str, Any]:
        """
        Analyze documents for narrative entropy patterns.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            Dictionary containing analysis results
        """
        if not docs:
            logger.warning("No documents provided for analysis.")
            return {
                "entropy_values": [],
                "mean_entropy": 0.0,
                "max_entropy": 0.0,
                "entropy_variance": 0.0,
                "high_entropy_segments": [],
                "entropy_gradient": []
            }
        
        # Calculate lexical entropy for each segment
        lexical_entropy = [self._calculate_lexical_entropy(doc) for doc in docs]
        
        # Calculate syntactic entropy for each segment
        syntactic_entropy = [self._calculate_syntactic_entropy(doc) for doc in docs]
        
        # Calculate semantic coherence for each segment
        semantic_coherence = [self._calculate_semantic_coherence(doc) for doc in docs]
        
        # Combine the entropy measures (weighted average)
        combined_entropy = [0.4 * l + 0.4 * s + 0.2 * (1 - c) for l, s, c in 
                           zip(lexical_entropy, syntactic_entropy, semantic_coherence)]
        
        # Calculate entropy gradient (changes between segments)
        entropy_gradient = [combined_entropy[i] - combined_entropy[i-1] for i in range(1, len(combined_entropy))]
        
        # Identify high entropy segments (above 75th percentile)
        entropy_threshold = np.percentile(combined_entropy, 75) if len(combined_entropy) > 1 else 0
        high_entropy_segments = [
            {"segment_index": i, "entropy": e}
            for i, e in enumerate(combined_entropy)
            if e > entropy_threshold
        ]
        
        # Calculate additional statistics
        mean_entropy = np.mean(combined_entropy)
        max_entropy = np.max(combined_entropy)
        entropy_variance = np.var(combined_entropy)
        
        return {
            "entropy_values": combined_entropy,
            "mean_entropy": float(mean_entropy),
            "max_entropy": float(max_entropy),
            "entropy_variance": float(entropy_variance),
            "high_entropy_segments": high_entropy_segments,
            "entropy_gradient": entropy_gradient,
            "lexical_entropy": lexical_entropy,
            "syntactic_entropy": syntactic_entropy,
            "semantic_coherence": semantic_coherence
        }
    
    def _calculate_lexical_entropy(self, doc: spacy.tokens.Doc) -> float:
        """
        Calculate lexical entropy based on word frequency distribution.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            Lexical entropy value
        """
        # Count lemmas (normalized word forms)
        lemma_counter = Counter(token.lemma_ for token in doc 
                               if not token.is_punct and not token.is_space)
        
        if not lemma_counter:
            return 0.0
        
        # Calculate frequency distribution
        freqs = np.array(list(lemma_counter.values()))
        freqs = freqs / freqs.sum()
        
        # Calculate Shannon entropy
        return float(entropy(freqs, base=2))
    
    def _calculate_syntactic_entropy(self, doc: spacy.tokens.Doc) -> float:
        """
        Calculate syntactic entropy based on dependency relations.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            Syntactic entropy value
        """
        # Count dependency relations
        dep_counter = Counter(token.dep_ for token in doc)
        
        if not dep_counter:
            return 0.0
        
        # Calculate frequency distribution
        freqs = np.array(list(dep_counter.values()))
        freqs = freqs / freqs.sum()
        
        # Calculate Shannon entropy
        return float(entropy(freqs, base=2))
    
    def _calculate_semantic_coherence(self, doc: spacy.tokens.Doc) -> float:
        """
        Calculate semantic coherence based on sentence similarity.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            Semantic coherence value (1.0 = highly coherent, 0.0 = incoherent)
        """
        sentences = list(doc.sents)
        
        if len(sentences) <= 1:
            return 1.0  # Single sentence is perfectly coherent with itself
        
        # Calculate pairwise similarities between adjacent sentences
        similarities = []
        for i in range(len(sentences) - 1):
            # Use vector similarity between sentences
            sim = sentences[i].similarity(sentences[i+1])
            similarities.append(sim)
        
        # Return average similarity
        return float(np.mean(similarities))
    
    def get_entropy_heatmap_data(self, docs: List[spacy.tokens.Doc]) -> np.ndarray:
        """
        Generate data for entropy heatmap visualization.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            2D array of entropy values (sentences x words)
        """
        heatmap_data = []
        
        for doc in docs:
            sentences = list(doc.sents)
            sentence_entropies = []
            
            for sent in sentences:
                # Calculate entropy for each word in the sentence
                word_entropies = []
                for token in sent:
                    if token.is_punct or token.is_space:
                        continue
                    
                    # Simple word-level entropy based on character distribution
                    char_counter = Counter(token.text.lower())
                    char_freqs = np.array(list(char_counter.values()))
                    char_freqs = char_freqs / char_freqs.sum()
                    word_entropy = float(entropy(char_freqs, base=2))
                    
                    word_entropies.append(word_entropy)
                
                sentence_entropies.append(word_entropies)
            
            # Pad sentences to equal length
            max_len = max(len(s) for s in sentence_entropies) if sentence_entropies else 0
            padded_entropies = [s + [0] * (max_len - len(s)) for s in sentence_entropies]
            
            heatmap_data.append(padded_entropies)
        
        return np.array(heatmap_data)
