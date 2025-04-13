"""
Visualization utilities for the Field Distortion Engine.

This module provides functions for visualizing analysis results.
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import networkx as nx
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

def plot_entropy_heatmap(entropy_values: List[float], output_path: str) -> None:
    """
    Plot entropy heatmap visualization.
    
    Args:
        entropy_values: List of entropy values for each segment
        output_path: Path to save the visualization
    """
    try:
        plt.figure(figsize=(12, 6))
        
        # Reshape data for heatmap
        data = np.array(entropy_values).reshape(1, -1)
        
        # Create heatmap
        ax = sns.heatmap(
            data, 
            cmap="viridis", 
            annot=True, 
            fmt=".2f",
            cbar_kws={"label": "Entropy Value"}
        )
        
        # Set labels
        ax.set_xlabel("Text Segment Index")
        ax.set_ylabel("")
        ax.set_title("Narrative Entropy Distribution")
        
        # Show labels on y-axis
        ax.set_yticklabels(["Entropy"])
        
        # Save the figure
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        
        logger.info(f"Entropy heatmap saved to {output_path}")
    
    except Exception as e:
        logger.error(f"Error creating entropy heatmap: {e}")

def plot_drift_diagram(drift_vectors: List[Dict[str, Any]], output_path: str) -> None:
    """
    Plot narrative drift diagram visualization.
    
    Args:
        drift_vectors: List of drift vector dictionaries
        output_path: Path to save the visualization
    """
    try:
        if not drift_vectors:
            logger.warning("No drift vectors provided for visualization.")
            return
        
        plt.figure(figsize=(14, 8))
        
        # Extract segment indices and drift magnitudes
        segments = [d["segment_index"] for d in drift_vectors]
        magnitudes = [d["drift_magnitude"] for d in drift_vectors]
        
        # Plot drift magnitudes
        plt.plot(segments, magnitudes, 'o-', linewidth=2, markersize=8, color='blue')
        
        # Add annotations for top drifting terms
        for i, drift in enumerate(drift_vectors):
            pos_terms = drift["positive_drift"]
            if pos_terms:
                # Get top positive drift term
                top_term, value = pos_terms[-1]
                plt.annotate(
                    f"+{top_term}",
                    (segments[i], magnitudes[i]),
                    xytext=(10, 10),
                    textcoords="offset points",
                    color="green",
                    fontsize=9
                )
            
            neg_terms = drift["negative_drift"]
            if neg_terms:
                # Get top negative drift term
                top_term, value = neg_terms[0]
                plt.annotate(
                    f"-{top_term}",
                    (segments[i], magnitudes[i]),
                    xytext=(10, -10),
                    textcoords="offset points",
                    color="red",
                    fontsize=9
                )
        
        # Set labels and title
        plt.xlabel("Segment Index")
        plt.ylabel("Drift Magnitude")
        plt.title("Narrative Drift Diagram")
        
        # Set x-axis ticks
        plt.xticks(segments)
        
        # Add grid
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Save the figure
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        
        logger.info(f"Drift diagram saved to {output_path}")
    
    except Exception as e:
        logger.error(f"Error creating drift diagram: {e}")

def plot_fractal_signatures(fractal_signatures: List[Dict[str, Any]], output_path: str) -> None:
    """
    Plot fractal signatures visualization using a network graph.
    
    Args:
        fractal_signatures: List of fractal signature dictionaries
        output_path: Path to save the visualization
    """
    try:
        if not fractal_signatures:
            logger.warning("No fractal signatures provided for visualization.")
            return
        
        plt.figure(figsize=(12, 10))
        
        # Create a graph
        G = nx.Graph()
        
        # Add nodes for each segment
        all_segments = set()
        for sig in fractal_signatures:
            seg1, seg2 = sig["segment_pair"]
            all_segments.add(seg1)
            all_segments.add(seg2)
        
        for segment in all_segments:
            G.add_node(f"Segment {segment}")
        
        # Add edges for each fractal relationship
        for sig in fractal_signatures:
            seg1, seg2 = sig["segment_pair"]
            similarity = sig["similarity"]
            
            # Only add connections with significant similarity
            if similarity > 0.3:
                G.add_edge(
                    f"Segment {seg1}", 
                    f"Segment {seg2}", 
                    weight=similarity,
                    distance=sig["distance"]
                )
        
        # Get edge weights for width calculation
        edge_weights = [G[u][v]['weight'] * 5 for u, v in G.edges()]
        
        # Calculate node sizes based on connectivity
        node_sizes = [300 * (1 + G.degree(node)) for node in G.nodes()]
        
        # Set up layout
        pos = nx.spring_layout(G, seed=42)
        
        # Draw nodes
        nx.draw_networkx_nodes(
            G, pos, 
            node_size=node_sizes,
            node_color='lightblue',
            alpha=0.8
        )
        
        # Draw edges with varying width based on similarity
        nx.draw_networkx_edges(
            G, pos, 
            width=edge_weights,
            alpha=0.7,
            edge_color='gray'
        )
        
        # Draw labels
        nx.draw_networkx_labels(
            G, pos, 
            font_size=10,
            font_family='sans-serif'
        )
        
        # Add title
        plt.title("Fractal Relationship Network")
        
        # Remove axes
        plt.axis('off')
        
        # Save the figure
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        
        logger.info(f"Fractal signatures graph saved to {output_path}")
    
    except Exception as e:
        logger.error(f"Error creating fractal signatures graph: {e}")
