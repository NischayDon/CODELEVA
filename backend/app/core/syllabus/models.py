from pydantic import BaseModel
from typing import List, Dict, Optional, Set

class ConceptNode(BaseModel):
    id: str
    name: str
    description: str
    tier: str # "Beginner", "Intermediate", "Advanced"
    prerequisites: List[str] = [] # List of ConceptNode IDs
    documentation_links: List[str] = [] # Links to Python docs/CS50

class SyllabusGraph:
    """
    A Directed Acyclic Graph (DAG) of concepts.
    """
    def __init__(self):
        self.nodes: Dict[str, ConceptNode] = {}
        
    def add_node(self, node: ConceptNode):
        self.nodes[node.id] = node
        
    def get_prerequisites(self, concept_id: str) -> List[str]:
        return self.nodes.get(concept_id, ConceptNode(id=concept_id, name="Unknown", description="", tier="Beginner")).prerequisites

    def validate_flow(self, completed_concepts: Set[str], target_concept_id: str) -> bool:
        """
        Returns True if prerequisites are met.
        """
        if target_concept_id not in self.nodes:
            # If unknown, maybe allow? Or strict fail? 
            # Strict fail per "Disallow hardcoded lesson flows" - everything must be in syllabus.
            return False
            
        node = self.nodes[target_concept_id]
        for prereq_id in node.prerequisites:
            if prereq_id not in completed_concepts:
                return False
        return True
