import pandas as pd
import numpy as np
import json
import random
from jinja2 import Environment, FileSystemLoader

# สร้างข้อมูลจำลอง
dates = pd.date_range(start='2025-01-01', end='2025-01-31')
sales_data = [{
    'date': date.strftime('%Y-%m-%d'),
    'sales': int(np.random.randint(500, 2000))
} for date in dates]

asin_data = [
    {'asin': 'B08XYZ123A', 'revenue': 45000, 'rating': 4.8},
    {'asin': 'B08XYZ123B', 'revenue': 32000, 'rating': 4.2},
    {'asin': 'B08XYZ123C', 'revenue': 25000, 'rating': 4.5},
    {'asin': 'B08XYZ123D', 'revenue': 18000, 'rating': 3.9},
    {'asin': 'B08XYZ123E', 'revenue': 12000, 'rating': 4.1}
]

state_abbreviation_map = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming"
}

# The original list of state abbreviations
states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

# Create buyer data using the full state names
buyer_data = [{"state": state_abbreviation_map[state], "orders": random.randint(50, 2000)} for state in states]


# save as json
with open('kpi-demo/data.json', 'w') as f:
    json.dump({
        'salesData': sales_data,
        'asinData': asin_data,
        'buyerData': buyer_data
    }, f, indent=4)

# generate html
env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('kpi-demo/templates/pages/kpi-demo.html')

rendered_html = template.render()

with open('kpi-demo/index.html', 'w') as f:
    f.write(rendered_html)

print("kpi-demo/index.html has been generated successfully!")