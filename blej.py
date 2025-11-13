import google.generativeai as genai
import os

# Configure the Gemini API
# You'll need to set your API key as an environment variable or replace with your actual key
API_KEY = os.environ.get('GEMINI_API_KEY') or 'YOUR_API_KEY_HERE'
genai.configure(api_key=API_KEY)

def generate_fairy_story():
    """Generate a creative story about fairies using Gemini."""
    
    # Initialize the model
    model = genai.GenerativeModel('gemini-pro')
    
    # Create a prompt for generating a fairy story
    prompt = """Write a creative and enchanting short story about fairies. 
    The story should include:
    - Magical elements and whimsical descriptions
    - At least 2-3 fairy characters with unique personalities
    - A problem or adventure they face
    - A heartwarming resolution
    
    Make it engaging and suitable for all ages. Length: approximately 300-400 words."""
    
    print("Generating fairy story with Gemini AI...\n")
    print("=" * 70)
    
    try:
        # Generate the story
        response = model.generate_content(prompt)
        
        # Display the generated story
        print("\n✨ FAIRY STORY ✨\n")
        print(response.text)
        print("\n" + "=" * 70)
        
        return response.text
        
    except Exception as e:
        print(f"Error generating story: {e}")
        return None

if __name__ == "__main__":
    generate_fairy_story()

