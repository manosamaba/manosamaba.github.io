import os
import json
import shutil
from jinja2 import Environment, FileSystemLoader, ChoiceLoader
from datetime import datetime

# Define directories and files
OUTPUT_DIR = 'dist'
TEMPLATES_DIR = 'templates'
STATIC_DIR = 'static'
DATA_DIR = 'data'
SITE_JSON = os.path.join(DATA_DIR, 'site.json')
TIMELINE_JSON = os.path.join(DATA_DIR, 'timeline.json')

ML_DEMO_DIR = 'ml-demo'
ML_DEMO_TEMPLATES_DIR = os.path.join(ML_DEMO_DIR, 'templates')

KPI_DEMO_DIR = 'kpi-demo'
KPI_DEMO_TEMPLATES_DIR = os.path.join(KPI_DEMO_DIR, 'templates')

def load_data(file_path: str) -> dict:
    """Load JSON data from a specified file."""
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    print(f"Error: {file_path} not found.")
    return {}

def clean_output_directory():
    """Removes and recreates the output directory."""
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    print(f"Directory '{OUTPUT_DIR}' cleaned.")

def copy_static_files():
    """Copies all static files to the output directory."""
    ignore_patterns = shutil.ignore_patterns('*.py')

    if os.path.exists(STATIC_DIR):
        shutil.copytree(STATIC_DIR, os.path.join(OUTPUT_DIR, 'static'), ignore=ignore_patterns, dirs_exist_ok=True)
        print("Static files copied successfully.")

    #Copy the ml-demo project directory to the output
    ML_DEMO_DIR = 'ml-demo'
    if os.path.exists(ML_DEMO_DIR):
        shutil.copytree(ML_DEMO_DIR, os.path.join(OUTPUT_DIR, ML_DEMO_DIR), ignore=ignore_patterns, dirs_exist_ok=True)
        print("ML demo project copied successfully.")

    #Copy the kpi-demo project directory to the output
    KPI_DEMO_DIR = 'kpi-demo'
    if os.path.exists(KPI_DEMO_DIR):
        shutil.copytree(KPI_DEMO_DIR, os.path.join(OUTPUT_DIR, KPI_DEMO_DIR), ignore=ignore_patterns, dirs_exist_ok=True)
        print("KPI demo project copied successfully.")

# Create a global context dictionary
GLOBAL_CONTEXT = {}
JINJA_ENV = None

def setup_jinja_environment():
    """Initializes the Jinja2 environment and sets up global variables."""
    global JINJA_ENV
    
    # Load all data from your JSON files
    site_config = load_data(SITE_JSON)
    timeline_data = load_data(TIMELINE_JSON)

 
    # Example for tags_text, assuming it's a simple string or a variable
    tags_text = "Python, Data Science, Portfolio" 
    
    # Populate the global context
    GLOBAL_CONTEXT.update({
        'site': site_config,
        'timeline_data': timeline_data,
        'tags_text': tags_text,
        'lang': 'en'
    })


    # Set up the environment with ChoiceLoader
    template_loaders = [
        FileSystemLoader(TEMPLATES_DIR),
        FileSystemLoader(ML_DEMO_TEMPLATES_DIR),
        FileSystemLoader(KPI_DEMO_TEMPLATES_DIR)
    ]
    JINJA_ENV = Environment(loader=ChoiceLoader(template_loaders))
    JINJA_ENV.globals.update(GLOBAL_CONTEXT)
    JINJA_ENV.globals['now'] = datetime.now()

def generate_page(template_path: str, output_filename: str):
    """Renders a Jinja2 template to an HTML file using the global context."""
    if not JINJA_ENV:
        setup_jinja_environment()
        
    template = JINJA_ENV.get_template(template_path)
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    os.makedirs(os.path.dirname(output_path) or OUTPUT_DIR, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(template.render())
    print(f"Generated {output_filename} successfully.")

def main():
    """Main function to run the static site generation."""
    clean_output_directory()
    copy_static_files()
    setup_jinja_environment()  # Set up the environment once

    # Generate the main index.html page
    generate_page(
        template_path='pages/index.html',
        output_filename='index.html'
    )

    # Generate the ML demo
    generate_page(
        template_path='pages/ml-demo-page.html', 
        output_filename='ml-demo/index.html'
    )
    # Generate the KPI demo
    generate_page(
        template_path='pages/kpi-demo.html', 
        output_filename='kpi-demo/index.html'
    )

    print("\n✅ Static site generation complete!")

if __name__ == '__main__':
    main()