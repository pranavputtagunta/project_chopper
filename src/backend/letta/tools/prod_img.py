def prod_img(filepath=""):
    import google.generativeai as genai
    import os
    import json
    import PIL.Image as Image
    import numpy as np
    from PIL import ImageFile
    import cv2

    # Set your API key here

    genai.configure(api_key="API_KEY_HERE")

    default_system_insructions = """
    You are an assistant that extracts detailed information from an image of a drug label. 
    Given the image of a drug label, extract the following information and respond ONLY in JSON format with these fields (no extra text):

    - brand_name: The brand name of the drug.
    - generic_name: The generic/chemical name.
    - ingredients: A list of active ingredients.
    - manufacturer: The company manufacturing the drug.
    - dosage_instructions: Usage and dosage instructions as text.
    - warnings: Any warnings or precautions.
    - expiration_date: The expiration date if visible.
    - ndc_code: The National Drug Code if visible.
    - barcode: The barcode number if visible.
    - bounding_box: Coordinates of the drug label in the image (format: ymin, xmin, ymax, xmax normalized 0-1000).
    - image_url: If available, a URL of the drug label image.
    - feedback: Any notes about the image quality or confidence.

    Example JSON format:

    {
    "brand_name": "Tylenol",
    "generic_name": "Acetaminophen",
    "ingredients": ["Acetaminophen 500 mg"],
    "manufacturer": "Johnson & Johnson",
    "dosage_instructions": "Take 1-2 tablets every 4-6 hours.",
    "warnings": "Do not exceed 8 tablets in 24 hours.",
    "expiration_date": "2025-12-31",
    "ndc_code": "12345-6789",
    "barcode": "0123456789012",
    "feedback": "Image quality is good, text is clearly readable."
    }
    """

    default_safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
    ]

    default_config = {
        "temperature": 0.25,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain"
    }

    class DrugLabelExtractor:
        def __init__(self, system_instructions=default_system_insructions, safety_settings=default_safety_settings, config=default_config):
            self.response = None
            self.model = genai.GenerativeModel(
                model_name= "gemini-2.0-flash",
                safety_settings=safety_settings,
                system_instruction=system_instructions,
                generation_config=config
            )

        def process_drug_label_image(self, image: ImageFile) -> dict:
            # Call the API to process the product image
            response = self.model.generate_content(contents=[image])
            # Parse the response and return it as a dictionary
            self.response = json.loads(response.text[response.text.index("{"):response.text.rindex("}")+1])
            return self.response
        
        def process_drug_label_image_cv2(self, image: np.ndarray) -> dict:
            # Convert the image to a PIL Image
            image = Image.fromarray(image)
            # Call the API to process the product image
            response = self.model.generate_content(contents=[image])
            # Parse the response and return it as a dictionary
            self.response = json.loads(response.text[response.text.index("{"):response.text.rindex("}")+1])
            return self.response
        
        def return_response(self):
            # Check if the response is available
            if self.response is None:
                raise Exception("No response available. Please process an image first.")
            return self.response

    def get_PIL_image(image_path: str) -> Image.Image:
        try:
            image = Image.open(image_path)
            return image
        except Exception as e:
            print(f"Error loading image: {e}")
            return None
    
    PIL_Image = get_PIL_image(filepath)
    extractor = DrugLabelExtractor()
    extractor.process_drug_label_image_cv2
    return extractor.return_response