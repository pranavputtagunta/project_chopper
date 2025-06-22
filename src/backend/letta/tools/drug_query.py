from typing import Dict, List

def roll_dice() -> str:
    """
    Simulate the roll of a 20-sided die (d20).
    This function generates a random integer between 1 and 20, inclusive,
    which represents the outcome of a single roll of a d20.
    Returns:
        str: The result of the die roll.
    """
    import random
    dice_role_outcome = random.randint(1, 20)
    output_string = f"You rolled a {dice_role_outcome}"
    return output_string

def fda_prod_label_search(brand_name: str ="", generic_name: str ="", product_ndc: str="", ingredients: List[str] = []) -> Dict[str, str]:
    import requests 
    import json

    # FDA Product Label Search
    default_gateway = "https://api.fda.gov/drug/label.json?search="
    
    # Define search
    brand_name_search = f'openfda.brand_name:"{brand_name}"' if brand_name else ""
    ingredients_string='+AND+'.join(f'"{item}"' for item in ingredients)
    ingredient_search = f'openfda.substance_name:({ingredients_string})' if ingredients else ""
    generic_name_search = f'openfda.generic_name:"{generic_name}"' if generic_name else ""
    product_ndc_search = f'openfda.product_ndc:"{product_ndc}"' if product_ndc else ""

    # Parameters
    params = {
        'search': '+AND+'.join([brand_name_search, ingredient_search, generic_name_search, product_ndc_search]),
        'limit': 1
    }

    # Call API
    response = requests.get(default_gateway, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"FDA API error code {response.status_code}"}

def fda_drugsfda_search(brand_name="", generic_name="", product_ndc="", ingredients: List[str]= []) -> dict:
    import requests
    # FDA Drugs@FDA endpoint
    base_url = "https://api.fda.gov/drug/drugsfda.json"
    
    # Build search queries conditionally
    brand_name_search = f'openfda.brand_name:"{brand_name}"' if brand_name else ""
    ingredient_search = (
        'openfda.substance_name:(' +
        ' +AND+ '.join(f'"{item}"' for item in ingredients) +
        ')'
    ) if ingredients else ""
    generic_name_search = f'openfda.generic_name:"{generic_name}"' if generic_name else ""
    product_ndc_search = f'openfda.product_ndc:"{product_ndc}"' if product_ndc else ""
    
    # Combine non-empty search parts with +AND+ (ignore empty)
    search_parts = [part for part in [brand_name_search, ingredient_search, generic_name_search, product_ndc_search] if part]
    search_query = '+AND+'.join(search_parts) if search_parts else ""
    
    # Parameters dictionary
    params = {
        'search': search_query,
        'limit': 1
    }
    
    # API request
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"FDA API error code {response.status_code}"}