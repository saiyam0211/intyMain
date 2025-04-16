import json

# Load the JSON data
with open('companies.json', 'r') as f:
    data = json.load(f)

companies = data.get('companies', [])
print(f'Total companies: {len(companies)}')

# Find companies with Commercial type
commercial_companies = [c for c in companies if any('Commercial' in t for t in c.get('type', []))]
print(f'Companies offering Commercial services: {len(commercial_companies)}')

# Find companies in Bengaluru with Commercial type
bengaluru_commercial_companies = [c for c in commercial_companies if 'Bengaluru' in c.get('availableCities', [])]
print(f'Companies in Bengaluru offering Commercial services: {len(bengaluru_commercial_companies)}')

print('\nList of commercial companies:')
for i, company in enumerate(commercial_companies, 1):
    print(f"{i}. {company.get('name', 'Unknown')}") 