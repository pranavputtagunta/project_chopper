import os
import json
from letta_client import Letta, AgentState
from dotenv import load_dotenv
from typing import Dict, List

# Import tools here
from tools.drug_query import fda_prod_label_search, fda_drugsfda_search, roll_dice
from tools.msg_doctor import msg_doctor
from tools.prod_img import prod_img

# Load environment variables
load_dotenv()

# Initialize Letta client
client = Letta(token=os.getenv("LETTA_API_KEY"))

class Agents:
    CONNECTIONS= {
        "management_agent": ['health_advice_agent'], # 'healthcare_consulting_agent'],
        "health_advice_agent": ['management_agent', 'medicine_agent'], #diet_exercise_agent
        # "healthcare_consulting_agent": ['management_agent', 'doctor_location_agent', 'medicine_location_agent'],
        "medicine_agent": ['health_advice_agent'], # 'medicine_location_agent'],
        # "diet_exercise_agent": ['health_advice_agent'],
        # "doctor_location_agent": ['healthcare_consulting_agent'],
        # "medicine_location_agent": ['healthcare_consulting_agent', 'medicine_agent'],
        # "insurance_suggestion_agent": ['healthcare_consulting_agent']
    }
    SCHEMAS = {
        "fda_prod_label_search_schema": "src/backend/letta/tools/tool_schemas/fda_prod_label_search_schema.json",
        "fda_drugsfda_search_schema": "src/backend/letta/tools/tool_schemas/fda_drugsfda_search_schema.json",
        "msg_doctor_schema": "src/backend/letta/tools/tool_schemas/msg_doctor_schema.json",
        "prod_img_schema": "src/backend/letta/tools/tool_schemas/prod_img_schema.json"
    }
    agent_store: Dict[str, AgentState] = {}

    def __init__(self):
        self.initialize_agents()

    @staticmethod
    def get_instance():
        """Returns the singleton instance of the Agents class."""
        if not hasattr(Agents, "_instance"):
            Agents._instance = Agents()
        return Agents._instance

    def load_agent_config(self, filename: str) -> Dict:
        """Loads an agent's configuration from its .af file."""
        with open(filename, 'r') as f:
            return json.load(f)
        
    def update_agent_persona(self, agent_id: str, new_persona_content: str):
        """Updates the persona memory block of an existing agent."""
        
        response = client.agents.blocks.modify(
            agent_id=agent_id,
            block_label='persona',
            value=new_persona_content
        )

        print(client.agents.blocks.list(agent_id=agent_id))
        print("New content: ", new_persona_content)
        print("Response: ", response)

        print(f"Updated persona for agent {agent_id}")

    def load_json_from_file(self, filename: str) -> dict:
        """Loads and returns JSON data from a file."""
        with open(filename, 'r', encoding= 'utf-8') as f:
            return json.load(f)
    
    def initialize_agents(self): 
        # Register custom tools
        # tool_test = client.tools.create_from_function(func=roll_dice)
        tool_fda_prod = client.tools.upsert_from_function(func=fda_prod_label_search, json_schema=self.load_json_from_file(self.SCHEMAS["fda_prod_label_search_schema"]))
        tool_fda_drugs = client.tools.upsert_from_function(func=fda_drugsfda_search, json_schema=self.load_json_from_file(self.SCHEMAS["fda_drugsfda_search_schema"]))
        tool_msg_doctor = client.tools.upsert_from_function(func=msg_doctor, json_schema=self.load_json_from_file(self.SCHEMAS["msg_doctor_schema"]))
        tool_prod_img = client.tools.upsert_from_function(func=prod_img, json_schema=self.load_json_from_file(self.SCHEMAS["prod_img_schema"]))
        
        # Define tool schemas
        all_tools: Dict[str, List] = {}
        for agent_name in self.CONNECTIONS.keys():
            all_tools[agent_name] = []
        all_tools["medicine_agent"] = [tool_fda_prod, tool_fda_drugs, tool_prod_img] # Add more tools as needed
        all_tools["health_advice_agent"] = [tool_msg_doctor]
        for agent_name, tools in all_tools.items():
            all_tools[agent_name] = [t.json_schema["name"] for t in tools]
            all_tools[agent_name].extend(["web_search", "run_code", "send_message_to_agent_async"]) # Built in tools

        # Create agents from .af files
        agent_configs: Dict[str, Dict] = {}

        for agent_name in self.CONNECTIONS.keys():
            af_file = f"src/backend/letta/agent_files/{agent_name}.af"
            if not os.path.exists(af_file):
                raise FileNotFoundError(f"Agent config file not found: {af_file}")
            agent_config = self.load_agent_config(af_file)
            agent_configs[agent_name] = agent_config

            print(agent_config)
            
            # Create agent
            self.agent_store[agent_name] = client.agents.create(
                name=agent_config['name'],
                model=agent_config['model'],
                embedding=agent_config['embedding'],
                memory_blocks=[
                    {
                    "label": "persona",
                    "value": agent_config['persona'],
                    },
                ],
                tools=all_tools[agent_name],
                project_id=os.getenv("LETTA_PROJECT_ID")
            )

        # Connecting agents
        # Change agent names in personas to the file names
        for agent_name in self.CONNECTIONS.keys():
            persona_text = agent_configs[agent_name]['persona']
            for connection in self.CONNECTIONS[agent_name]:
                if connection in persona_text:
                    new_text = persona_text.replace(
                        connection, f"{connection} (id: {self.agent_store[connection].id})"
                    )
                    print(f"Updating persona for {agent_name}:")
                    print(f"Before: {persona_text}")
                    print(f"After: {new_text}")
                    persona_text = new_text
            agent_configs[agent_name]['persona'] = persona_text
            self.update_agent_persona(self.agent_store[agent_name].id, persona_text)    

    def query_management_agent(self, query: str) -> AgentState:
        """Queries the management agent with a given query."""
        if "management_agent" not in self.agent_store:
            raise ValueError("Management agent not initialized.")
        
        response = client.agents.messages.create(
            agent_id=self.agent_store["management_agent"].id,
            messages=[{"role": "user", "content": query}],
        )

        for msg in response.messages:
            print(msg)
    
def main(): 
    agents = Agents.get_instance()
    # Example query to the management agent
    response = agents.query_management_agent("What is the best treatment for diabetes? I missed my insulin dose today. What should I do? User is a 45-year type 2 diabetic with a history of hypertension and high cholesterol. User is currently on metformin and lisinopril. User is also experiencing some anxiety about their condition. Current doctor is sbhatnagar@ucsd.edu (use this for Slack messages)")
    print("Response from management agent:", response)

if __name__ == "__main__":
    main()