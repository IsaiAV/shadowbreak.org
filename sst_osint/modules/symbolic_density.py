"""
Symbolic Density Analyzer (SDA) Module

This module identifies symbol-heavy language or metaphor clusters and flags
"emotional black holes" in testimony or grooming messages.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
import spacy
import logging
from collections import Counter
import re

logger = logging.getLogger(__name__)

class SymbolicDensityAnalyzer:
    """
    Symbolic Density Analyzer (SDA) class for identifying symbol-heavy language.
    """
    
    def __init__(self, nlp: spacy.language.Language):
        """
        Initialize the Symbolic Density Analyzer.
        
        Args:
            nlp: spaCy language model
        """
        self.nlp = nlp
        
        # Initialize symbol banks
        self._initialize_symbol_banks()
        
        logger.info("Symbolic Density Analyzer initialized")
    
    def _initialize_symbol_banks(self):
        """Initialize dictionaries of symbolic language markers."""
        # Emotional symbol bank (words with strong emotional loading)
        self.emotional_symbols = {
            "family": 0.7, "child": 0.75, "love": 0.8, "heart": 0.7, "pain": 0.8,
            "fear": 0.85, "death": 0.9, "life": 0.7, "soul": 0.8, "spirit": 0.75,
            "blood": 0.8, "god": 0.85, "heaven": 0.8, "hell": 0.85, "angel": 0.75,
            "demon": 0.85, "devil": 0.9, "evil": 0.85, "good": 0.7, "pure": 0.75,
            "dark": 0.8, "light": 0.8, "shadow": 0.85, "secret": 0.8, "truth": 0.75,
            "lie": 0.8, "power": 0.75, "control": 0.8, "freedom": 0.8, "prison": 0.85,
            "cage": 0.85, "trap": 0.8, "escape": 0.75, "voice": 0.7, "silence": 0.75,
            "cry": 0.8, "tear": 0.75, "smile": 0.7, "laugh": 0.7, "scream": 0.85,
            "touch": 0.75, "hurt": 0.8, "heal": 0.7, "wound": 0.8, "scar": 0.85,
            "break": 0.75, "fix": 0.7, "trust": 0.8, "betray": 0.85, "promise": 0.75
        }
        
        # Physical symbols (concrete objects that often carry symbolic weight)
        self.physical_symbols = {
            "door": 0.7, "window": 0.7, "mirror": 0.8, "knife": 0.85, "gun": 0.9,
            "fire": 0.8, "water": 0.7, "earth": 0.7, "air": 0.7, "stone": 0.7,
            "wall": 0.75, "chain": 0.85, "rope": 0.8, "mask": 0.85, "key": 0.8,
            "lock": 0.8, "box": 0.7, "gift": 0.7, "throne": 0.8, "crown": 0.8,
            "sword": 0.8, "shield": 0.75, "bridge": 0.7, "path": 0.7, "road": 0.7,
            "star": 0.75, "sun": 0.75, "moon": 0.75, "eye": 0.8, "hand": 0.7,
            "heart": 0.8, "head": 0.7, "body": 0.7, "flesh": 0.8, "bone": 0.75,
            "blood": 0.8, "tear": 0.8, "rose": 0.75, "flower": 0.7, "tree": 0.7,
            "forest": 0.75, "mountain": 0.7, "sea": 0.75, "river": 0.7, "island": 0.7
        }
        
        # Abstract concept symbols (abstract ideas that often represent other things)
        self.abstract_symbols = {
            "time": 0.7, "memory": 0.8, "dream": 0.8, "nightmare": 0.85, "hope": 0.75,
            "despair": 0.85, "fate": 0.8, "destiny": 0.8, "chance": 0.7, "luck": 0.7,
            "justice": 0.75, "mercy": 0.75, "vengeance": 0.8, "revenge": 0.8, "forgiveness": 0.75,
            "sin": 0.85, "virtue": 0.75, "innocence": 0.8, "guilt": 0.8, "shame": 0.85,
            "honor": 0.75, "pride": 0.75, "humility": 0.7, "courage": 0.75, "fear": 0.8,
            "love": 0.8, "hate": 0.85, "passion": 0.75, "desire": 0.8, "lust": 0.85,
            "greed": 0.8, "envy": 0.8, "wrath": 0.85, "sloth": 0.7, "gluttony": 0.75,
            "wisdom": 0.7, "knowledge": 0.7, "truth": 0.8, "lie": 0.8, "reality": 0.75
        }
        
        # Grooming language patterns (phrases often used in grooming scenarios)
        self.grooming_patterns = [
            r"our secret", r"special relationship", r"just between us", r"no one will understand",
            r"others would be jealous", r"you're so mature", r"you're different", r"you're special",
            r"you understand me", r"i trust you", r"do you trust me", r"prove your love",
            r"if you love me", r"need you", r"can't live without you", r"no one else matters",
            r"they're trying to separate us", r"they're jealous", r"they don't understand",
            r"you belong to me", r"you're mine", r"i own you", r"you owe me", r"after all i've done",
            r"look what you made me do", r"this is your fault", r"you asked for this",
            r"you wanted this", r"you deserve this", r"you need to be punished", r"teach you a lesson"
        ]
        
        # Combine all symbols
        self.all_symbols = {}
        self.all_symbols.update(self.emotional_symbols)
        self.all_symbols.update(self.physical_symbols)
        self.all_symbols.update(self.abstract_symbols)
        
        # Compile grooming patterns
        self.compiled_grooming_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.grooming_patterns]
    
    def analyze(self, docs: List[spacy.tokens.Doc]) -> Dict[str, Any]:
        """
        Analyze documents for symbolic density patterns.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            Dictionary containing analysis results
        """
        if not docs:
            logger.warning("No documents provided for analysis.")
            return {
                "symbol_density": [],
                "mean_density": 0.0,
                "max_density": 0.0,
                "top_symbols": [],
                "symbol_clusters": [],
                "emotional_blackholes": [],
                "grooming_patterns": []
            }
        
        # Calculate symbolic density for each segment
        symbol_density = []
        segment_symbols = []
        
        for i, doc in enumerate(docs):
            # Count symbols and their weights
            symbols_found = self._extract_symbols(doc)
            
            # Calculate density (weighted sum of symbols / total words)
            total_words = len([token for token in doc if not token.is_punct and not token.is_space])
            total_weight = sum(weight for _, weight in symbols_found)
            
            density = total_weight / max(1, total_words)
            symbol_density.append(density)
            
            # Store symbols found in this segment
            segment_symbols.append({
                "segment_index": i,
                "symbols": [symbol for symbol, _ in symbols_found],
                "density": density
            })
        
        # Find emotional blackholes (segments with very high symbolic density)
        density_threshold = np.percentile(symbol_density, 90) if len(symbol_density) > 1 else 0
        emotional_blackholes = [
            {"segment_index": i, "density": d}
            for i, d in enumerate(symbol_density)
            if d > density_threshold
        ]
        
        # Find symbol clusters (segments with many related symbols)
        symbol_clusters = self._find_symbol_clusters(segment_symbols)
        
        # Detect grooming language patterns
        grooming_patterns = self._detect_grooming_patterns(docs)
        
        # Get top symbols across all segments
        all_symbols = [symbol for segment in segment_symbols for symbol in segment["symbols"]]
        symbol_counter = Counter(all_symbols)
        top_symbols = [symbol for symbol, _ in symbol_counter.most_common(20)]
        
        # Calculate statistics
        mean_density = np.mean(symbol_density)
        max_density = np.max(symbol_density)
        
        return {
            "symbol_density": symbol_density,
            "mean_density": float(mean_density),
            "max_density": float(max_density),
            "top_symbols": top_symbols,
            "symbol_clusters": symbol_clusters,
            "emotional_blackholes": emotional_blackholes,
            "grooming_patterns": grooming_patterns
        }
    
    def _extract_symbols(self, doc: spacy.tokens.Doc) -> List[Tuple[str, float]]:
        """
        Extract symbolic language from a document.
        
        Args:
            doc: spaCy Doc object
            
        Returns:
            List of tuples (symbol, weight)
        """
        symbols_found = []
        
        # Check individual tokens
        for token in doc:
            if token.is_punct or token.is_space:
                continue
            
            # Check if lemma is in symbol bank
            lemma = token.lemma_.lower()
            if lemma in self.all_symbols:
                symbols_found.append((lemma, self.all_symbols[lemma]))
        
        return symbols_found
    
    def _find_symbol_clusters(self, segment_symbols: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Find clusters of related symbols within segments.
        
        Args:
            segment_symbols: List of symbols found in each segment
            
        Returns:
            List of symbol clusters
        """
        clusters = []
        
        for segment in segment_symbols:
            # Skip segments with few symbols
            if len(segment["symbols"]) < 3:
                continue
            
            # Group symbols by type
            emotional = [s for s in segment["symbols"] if s in self.emotional_symbols]
            physical = [s for s in segment["symbols"] if s in self.physical_symbols]
            abstract = [s for s in segment["symbols"] if s in self.abstract_symbols]
            
            # Check if we have a cluster in any category (at least 3 symbols)
            if len(emotional) >= 3:
                clusters.append({
                    "segment_index": segment["segment_index"],
                    "cluster_type": "emotional",
                    "symbols": emotional,
                    "count": len(emotional)
                })
            
            if len(physical) >= 3:
                clusters.append({
                    "segment_index": segment["segment_index"],
                    "cluster_type": "physical",
                    "symbols": physical,
                    "count": len(physical)
                })
            
            if len(abstract) >= 3:
                clusters.append({
                    "segment_index": segment["segment_index"],
                    "cluster_type": "abstract",
                    "symbols": abstract,
                    "count": len(abstract)
                })
        
        return clusters
    
    def _detect_grooming_patterns(self, docs: List[spacy.tokens.Doc]) -> List[Dict[str, Any]]:
        """
        Detect grooming language patterns in documents.
        
        Args:
            docs: List of spaCy Doc objects
            
        Returns:
            List of detected grooming patterns
        """
        grooming_detected = []
        
        for i, doc in enumerate(docs):
            matches = []
            text = doc.text.lower()
            
            # Check for grooming patterns
            for j, pattern in enumerate(self.compiled_grooming_patterns):
                for match in pattern.finditer(text):
                    matches.append({
                        "pattern": self.grooming_patterns[j],
                        "text": match.group(0),
                        "start": match.start(),
                        "end": match.end()
                    })
            
            if matches:
                grooming_detected.append({
                    "segment_index": i,
                    "matches": matches,
                    "count": len(matches)
                })
        
        return grooming_detected
