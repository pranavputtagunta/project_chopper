from letta_client import Letta
from dotenv import load_dotenv
import os
load_dotenv()
client = Letta(
    token=os.getenv("LETTA_API_KEY"),
)
client.tools.delete("tool-d32332b5-2bb8-4a13-9c67-f0dae9fc8a18")
tools = client.tools.list()
for tool in tools: 
    print(f"Tool ID: {tool.id}, Name: {tool.name}, Description: {tool.description}")