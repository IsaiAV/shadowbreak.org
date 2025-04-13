"""
Text processing utilities for the Field Distortion Engine.

This module provides functions for preprocessing and segmenting text.
"""

import re
from typing import List

def preprocess_text(text: str) -> str:
    """
    Preprocess text for analysis.
    
    Args:
        text: Input text
        
    Returns:
        Preprocessed text
    """
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove URLs
    text = re.sub(r'https?://\S+', ' [URL] ', text)
    
    # Normalize quotes
    text = re.sub(r'["""]', '"', text)
    text = re.sub(r"['']", "'", text)
    
    # Replace repeated punctuation
    text = re.sub(r'\.{3,}', '...', text)
    text = re.sub(r'!{2,}', '!', text)
    text = re.sub(r'\?{2,}', '?', text)
    
    return text.strip()

def segment_text(text: str, max_segment_length: int = 1000) -> List[str]:
    """
    Segment text into smaller chunks for analysis.
    
    Args:
        text: Input text
        max_segment_length: Maximum length of each segment (in characters)
        
    Returns:
        List of text segments
    """
    # If text is shorter than max_segment_length, return as single segment
    if len(text) <= max_segment_length:
        return [text]
    
    # Try to segment at paragraph boundaries
    paragraphs = re.split(r'\n\s*\n', text)
    
    # If each paragraph is short enough, use paragraphs as segments
    if all(len(p) <= max_segment_length for p in paragraphs):
        return [p for p in paragraphs if p.strip()]
    
    # Otherwise, segment based on max length, trying to break at sentence boundaries
    segments = []
    current_segment = ""
    
    for paragraph in paragraphs:
        # If adding this paragraph would exceed max length, finalize current segment
        if len(current_segment) + len(paragraph) > max_segment_length:
            if current_segment:
                segments.append(current_segment)
            
            # If paragraph itself is too long, split it by sentences
            if len(paragraph) > max_segment_length:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                current_segment = ""
                
                for sentence in sentences:
                    # If adding this sentence would exceed max length, finalize current segment
                    if len(current_segment) + len(sentence) > max_segment_length:
                        if current_segment:
                            segments.append(current_segment)
                        
                        # If sentence itself is too long, split it by max length
                        if len(sentence) > max_segment_length:
                            # Split by max length
                            for i in range(0, len(sentence), max_segment_length):
                                segment = sentence[i:i + max_segment_length]
                                segments.append(segment)
                            current_segment = ""
                        else:
                            current_segment = sentence
                    else:
                        current_segment += " " + sentence if current_segment else sentence
            else:
                current_segment = paragraph
        else:
            current_segment += "\n\n" + paragraph if current_segment else paragraph
    
    # Add final segment if not empty
    if current_segment:
        segments.append(current_segment)
    
    return [segment.strip() for segment in segments if segment.strip()]
