import json

# Load the JSON data
with open('companies.json', 'r') as f:
    data = json.load(f)

companies = data.get('companies', [])
print(f'Total companies: {len(companies)}')

# Filter for Bengaluru companies
bengaluru_companies = [c for c in companies if 'Bengaluru' in c.get('availableCities', [])]
print(f'Companies in Bengaluru: {len(bengaluru_companies)}')

# Filter for residential companies in Bengaluru
residential_companies = [c for c in bengaluru_companies if any('Residential' in t for t in c.get('type', []))]
print(f'Companies in Bengaluru offering Residential services: {len(residential_companies)}')

print('\nList of residential companies in Bengaluru:')
for i, company in enumerate(residential_companies, 1):
    print(f"{i}. {company.get('name', 'Unknown')}") 