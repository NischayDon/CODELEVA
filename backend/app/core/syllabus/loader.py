import json
from .models import SyllabusGraph, ConceptNode

# MOCK DATASET (Simulating CS50 + Python Docs)
# In real prod, this would read from external JSON/YAML files generated from the datasets.
BOOTSTRAP_DATASET = [
    {
        "id": "py_variables",
        "name": "Variables & Types",
        "description": "Basic data types in Python. Ref: CS50 Week 0.",
        "tier": "Beginner",
        "prerequisites": [],
        "documentation_links": ["https://docs.python.org/3/tutorial/introduction.html"]
    },
    {
        "id": "py_control_flow",
        "name": "Control Flow",
        "description": "Loops and conditionals. Ref: CS50 Week 1.",
        "tier": "Beginner",
        "prerequisites": ["py_variables"],
        "documentation_links": ["https://docs.python.org/3/tutorial/controlflow.html"]
    },
    {
        "id": "py_functions",
        "name": "Functions",
        "description": "Defining functions. Ref: CS50 Week 2.",
        "tier": "Intermediate",
        "prerequisites": ["py_control_flow"],
        "documentation_links": ["https://docs.python.org/3/tutorial/controlflow.html#defining-functions"]
    }
]

def load_syllabus() -> SyllabusGraph:
    graph = SyllabusGraph()
    # In future: Load from 'assets/syllabus/*.json'
    for item in BOOTSTRAP_DATASET:
        node = ConceptNode(**item)
        graph.add_node(node)
    
    print(f"Loaded {len(graph.nodes)} concepts into Syllabus.")
    return graph

# Singleton instance
global_syllabus = load_syllabus()
