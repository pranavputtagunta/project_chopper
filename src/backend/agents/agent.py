from letta_client import Letta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = Letta(token=os.getenv("LETTA_API_KEY"))

def agents(): 
    """Returns a dictionary of agent instances."""
    return {
        "document_parser": DocumentParser.getInstance(),
        "insurance_recommender": InsuranceRecommender.getInstance(),
        "medicine_explainer": MedicineExplainer.getInstance(),
        "pill_identifier": PillIdentifier.getInstance(),
        "conversational_interface": ConversationalInterface.getInstance()
    }

class Agent():
    """Base class for all agents."""
    
    def __init__(self, name: str, id: str):
        self.name = name
        self.id = id
        self.client = client

    def initialize(self):
        """Initializes the agent by retrieving its configuration."""
        if not self.id:
            raise ValueError(f"{self.name} ID environment variable is not set.")
        
        self.agent = self.client.agents.retrieve(agent_id=self.id)

class DocumentParser(Agent):
    _instance = None

    def __init__(self):
        super().__init__(
            name="document parser",
            id=os.getenv("DOCUMENT_PARSER_ID"),
        )
        self.initialize()

    @staticmethod
    def getInstance():
        if DocumentParser._instance is None:
            DocumentParser._instance = DocumentParser()
        return DocumentParser._instance
    
class InsuranceRecommender(Agent):
    _instance = None

    def __init__(self):
        super().__init__(
            name="insurance recommender",
            id=os.getenv("INSURANCE_RECOMMENDER_ID"),
        )
        self.initialize()

    @staticmethod
    def getInstance():
        if InsuranceRecommender._instance is None:
            InsuranceRecommender._instance = InsuranceRecommender()
        return InsuranceRecommender._instance
    
class MedicineExplainer(Agent):
    _instance = None

    def __init__(self):
        super().__init__(
            name="medicine explainer",
            id=os.getenv("MEDICINE_EXPLAINER_ID"),
        )
        self.initialize()

    @staticmethod
    def getInstance():
        if MedicineExplainer._instance is None:
            MedicineExplainer._instance = MedicineExplainer()
        return MedicineExplainer._instance
    
class PillIdentifier(Agent):
    _instance = None

    def __init__(self):
        super().__init__(
            name="pill identifier",
            id=os.getenv("PILL_IDENTIFIER_ID"),
        )
        self.initialize()

    @staticmethod
    def getInstance():
        if PillIdentifier._instance is None:
            PillIdentifier._instance = PillIdentifier()
        return PillIdentifier._instance
    
class ConversationalInterface(Agent):
    _instance = None

    def __init__(self):
        super().__init__(
            name="conversational interface",
            id=os.getenv("CONVERSATIONAL_INTERFACE_ID"),
        )
        self.initialize()

    @staticmethod
    def getInstance():
        if ConversationalInterface._instance is None:
            ConversationalInterface._instance = ConversationalInterface()
        return ConversationalInterface._instance