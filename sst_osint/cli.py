"""
Command-line interface for the Field Distortion Engine.

This module provides a command-line interface for running analyses 
using the Field Distortion Engine.
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from .fde import FieldDistortionEngine

logger = logging.getLogger(__name__)

def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Shadow Systems Theory Field Distortion Engine (FDE)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    parser.add_argument(
        "input", 
        nargs="?", 
        help="Path to input text file or direct text to analyze"
    )
    
    parser.add_argument(
        "-o", "--output-dir", 
        type=str, 
        default="./output",
        help="Directory to save visualization outputs"
    )
    
    parser.add_argument(
        "--gpu", 
        action="store_true",
        help="Use GPU acceleration if available"
    )
    
    parser.add_argument(
        "--analysis-type", 
        type=str, 
        choices=["drift", "entropy", "symbolic", "echo", "observer", "full"],
        default="full",
        help="Type of analysis to run"
    )
    
    parser.add_argument(
        "--segment-length", 
        type=int, 
        default=200,
        help="Length of text segments for analysis (in characters)"
    )
    
    return parser.parse_args()

def print_divider():
    """Print a divider line."""
    print("─" * 80)

def print_summary(results: Dict[str, Any]):
    """
    Print a summary of the analysis results.
    
    Args:
        results: Dictionary containing analysis results
    """
    print_divider()
    print("FIELD DISTORTION ENGINE - ANALYSIS SUMMARY")
    print_divider()
    
    print(f"Field Classification: {results['field_classification']}")
    print(f"Field Curvature (λ∇Ψ): {results['field_curvature']:.4f}")
    print(f"Number of Segments Analyzed: {results['num_segments']}")
    
    print("\nNarrative Entropy:")
    print(f"  Mean Entropy: {results['narrative_entropy']['mean_entropy']:.4f}")
    print(f"  Max Entropy: {results['narrative_entropy']['max_entropy']:.4f}")
    print(f"  Entropy Variance: {results['narrative_entropy']['entropy_variance']:.4f}")
    
    print("\nSymbolic Density:")
    print(f"  Mean Density: {results['symbolic_density']['mean_density']:.4f}")
    print(f"  Max Density: {results['symbolic_density']['max_density']:.4f}")
    print(f"  Top Symbols: {', '.join(results['symbolic_density']['top_symbols'][:5])}")
    
    print("\nEcho Patterns:")
    print(f"  Echo Count: {results['echo_patterns']['echo_count']}")
    print(f"  Mean Echo Intensity: {results['echo_patterns']['mean_intensity']:.4f}")
    if results['echo_patterns']['top_echoes']:
        print(f"  Top Echo: \"{results['echo_patterns']['top_echoes'][0][0]}\" " +
              f"(intensity: {results['echo_patterns']['top_echoes'][0][1]:.2f})")
    
    print_divider()
    print("INTERPRETATION GUIDELINES:")
    
    if results['field_classification'] == "Stable Field":
        print("  • Narrative appears coherent with minimal distortion")
        print("  • Low risk of emotional manipulation or narrative warping")
        print("  • Standard communication patterns detected")
    
    elif results['field_classification'] == "Distorted Field":
        print("  • Moderate narrative distortion detected")
        print("  • Potential emotional manipulation present")
        print("  • Recommend closer analysis of high-entropy segments")
    
    else:  # Recursive Collapse
        print("  • Severe narrative distortion detected")
        print("  • High probability of emotional manipulation")
        print("  • Recursive language patterns suggest coercive intent")
        print("  • ALERT: Narrative exhibits signs of trauma-based manipulation")
    
    print_divider()

def get_input_text(input_arg: Optional[str]) -> str:
    """
    Get input text from file or direct input.
    
    Args:
        input_arg: Path to input file or direct text
        
    Returns:
        Text to analyze
    """
    # If no input is provided, ask for it
    if input_arg is None:
        print("Enter/paste the text to analyze (Ctrl+D to finish):")
        lines = []
        while True:
            try:
                line = input()
                lines.append(line)
            except EOFError:
                break
            except KeyboardInterrupt:
                print("\nOperation cancelled.")
                sys.exit(1)
        return "\n".join(lines)
    
    # If input is a file path
    if os.path.isfile(input_arg):
        try:
            with open(input_arg, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            sys.exit(1)
    
    # Otherwise, assume it's direct text
    return input_arg

def create_output_dir(output_dir: str) -> str:
    """
    Create output directory if it doesn't exist.
    
    Args:
        output_dir: Directory to create
        
    Returns:
        Path to created directory
    """
    output_path = Path(output_dir)
    try:
        output_path.mkdir(parents=True, exist_ok=True)
        return str(output_path)
    except Exception as e:
        logger.error(f"Error creating output directory: {e}")
        return None

def display_ascii_banner():
    """Display ASCII art banner."""
    banner = """
███████╗███████╗████████╗    ███████╗██████╗ ███████╗
██╔════╝██╔════╝╚══██╔══╝    ██╔════╝██╔══██╗██╔════╝
███████╗███████╗   ██║       █████╗  ██║  ██║█████╗  
╚════██║╚════██║   ██║       ██╔══╝  ██║  ██║██╔══╝  
███████║███████║   ██║       ██║     ██████╔╝███████╗
╚══════╝╚══════╝   ╚═╝       ╚═╝     ╚═════╝ ╚══════╝
                                                                
Shadow Systems Theory - Field Distortion Engine v0.1.0
λ∇Ψ Narrative Analysis Framework
"""
    print(banner)

def run_cli():
    """Run the CLI interface."""
    display_ascii_banner()
    args = parse_args()
    
    # Create FDE instance
    fde = FieldDistortionEngine(use_gpu=args.gpu)
    
    # Get input text
    input_text = get_input_text(args.input)
    if not input_text:
        logger.error("No input text provided.")
        sys.exit(1)
    
    print(f"Analyzing text ({len(input_text)} characters)...")
    
    # Create output directory
    output_dir = create_output_dir(args.output_dir)
    
    # Run analysis
    results = fde.analyze(input_text, output_dir)
    
    # Print summary
    print_summary(results)
    
    # Notify about visualizations
    if output_dir:
        print(f"\nVisualizations saved to: {output_dir}")
        print("  • entropy_heatmap.png - Entropy distribution across text segments")
        print("  • drift_diagram.png - Narrative drift visualization")
        print("  • fractal_signatures.png - Fractal pattern signatures")

if __name__ == "__main__":
    run_cli()
