import pandas as pd

# Path to your Excel file
file_path = "IW_Company_Detail.xlsx"

# Load the "Interior Companies" sheet
df = pd.read_excel(file_path, sheet_name="Interior Companies")

# Define scoring function
def calculate_company_score(row):
    score = 0.0
    
    # Rating & Reviews: 0 - 1
    try:
        rating = float(row.get("Google Rating", 0)) or 0
    except:
        rating = 0
    try:
        reviews = int(row.get("Google Reviews", 0)) or 0
    except:
        reviews = 0
    
    if reviews > 0:
        confidence = min(reviews / 100, 1)  # Scale with max at 100 reviews
        score += (rating / 5) * confidence
    
    # Age of company: 0 - 0.5
    try:
        ageYears = int(row.get("Age of company", 0)) or 0
    except:
        ageYears = 0
    if ageYears > 0:
        score += min(ageYears * 0.1, 0.5)
    
    # Projects Completed: 0 - 0.5
    try:
        projects = int(float(row.get("No.of projects completed", 0))) or 0
    except:
        projects = 0
    if projects > 0:
        score += min(projects * 0.01, 0.5)
    
    # Ongoing Offer: 0.5
    discounts = row.get("Discounts", "")
    if pd.notna(discounts) and str(discounts).strip() != "":
        score += 0.5
    
    # Awards: 0 / 0.25 / 0.5
    awards = row.get("Any Awards won?", "")
    if pd.notna(awards) and str(awards).strip() != "":
        award_text = str(awards).lower()
        if any(keyword in award_text for keyword in ["2023", "2024", "recent", "current"]):
            score += 0.5
        else:
            score += 0.25
    
    return round(score, 2)

# Apply scoring
df["Score"] = df.apply(calculate_company_score, axis=1)

# Save as CSV
output_file = "Interior_Companies_Scored.csv"
df.to_csv(output_file, index=False, encoding="utf-8-sig")

print(f"✅ Scoring completed! File saved as {output_file}")
