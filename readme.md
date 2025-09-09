# My Personal Portfolio

This is my personal portfolio, built using **Python** and the **Jinja2** templating engine to showcase my projects and skills.

The site is designed for easy local development and static deployment.

---

## Features
* **Jinja2 Templating:** The site is built with reusable HTML templates, allowing for a clean and efficient code base.
* **Virtual Environment:** Dependencies are managed in a clean, isolated environment.
* **Local Server:** A simple script is used to serve the site locally for development.
* **Static Build:** The entire site is compiled into static HTML pages for fast and easy deployment.
---

## Getting Started

### 1. Project Setup
First, create the project folder and set up a virtual environment to manage dependencies.

```bash
# Create and navigate to your project folder
mkdir my_project
cd my_project

# Create a virtual environment
python -m venv venv
```

### 2. Activate the Environment
You must activate the virtual environment before installing libraries.
* **Windows:**
```bash
.\venv\Scripts\activate
```
* **macOS / Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
Install Jinja2 and any other required libraries using pip.
```bash
pip install jinja2
```

### Usage
**Run Locally (for Development)**
Use the run.py script to start a local server and see your changes in real time.
```bash
python run.py
```

### prepare data for kpi-demo
**generate dummy data for kpi-demo**
Use the generate_data.py script to generate data.
```bash
python kpi-demo/generate_data.py 
```

### Build for Deployment
Use the generate_pages.py script to create the final static files in the dist folder.
```bash
python generate_pages.py
```

### Cloudflare Pages Settings
If you choose to deploy using Cloudflare Pages, use the following settings in your project dashboard.
* **Build command:**
```bash
pip install -r requirements.txt && python generate_pages.py
```
* **Build output directory:** /dist
* **Framework preset:** None


### Optional Customizations
* get fonts.woff2 https://gwfh.mranftl.com/
* build icon https://www.favicon-generator.org/
* icons https://primeng.org/icons