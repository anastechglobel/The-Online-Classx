with open("admin.html", "r", encoding="utf-8") as f:
    text = f.read()

# Fix saveNote
text = text.replace("isFree: (type === Free),", "isFree: (type === 'Free'),")

# Check if there are other occurrences of Free without quotes
text = text.replace("=== Free", "=== 'Free'")

with open("admin.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated admin.html successfully!")
