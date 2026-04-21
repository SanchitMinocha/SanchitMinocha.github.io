import json
import os

base_path = "/Users/msanchit/Desktop/web_development/my_website/assets/data"

def load_json(name):
    with open(os.path.join(base_path, name), 'r') as f:
        return json.load(f)

def load_txt(name):
    with open(os.path.join(base_path, name), 'r') as f:
        return f.read()

knowledge_base = []

# About
about_txt = load_txt('about.txt')
knowledge_base.append({
    "category": "About",
    "content": about_txt,
    "source": "about.txt"
})

# Experience
exp = load_json('experience.json')
for cat, items in exp.items():
    for item in items:
        knowledge_base.append({
            "category": f"Experience: {cat.capitalize()}",
            "content": f"{item['name']} - {item['tagline']}. URL: {item['url']}",
            "source": "experience.json"
        })

# Portfolios
portfolios = load_json('portfolios.json')
for p in portfolios:
    content = f"Project: {p['title']}. {p['description']} Impact: {p['impact']} Tech: {', '.join(p['details']['techStack'])}"
    knowledge_base.append({
        "category": "Portfolio",
        "content": content,
        "source": "portfolios.json"
    })

# Publications
publications = load_json('publications.json')
for pub in publications:
    content = f"Publication: {pub['title']}. Authors: {pub['authors']}. Journal: {pub['journal']} ({pub['year']}). Abstract: {pub['abstract']}"
    knowledge_base.append({
        "category": "Publication",
        "content": content,
        "source": "publications.json"
    })

# FAQ
faq = load_json('FAQ.json')
for f in faq:
    knowledge_base.append({
        "category": "FAQ",
        "content": f"Question: {f['question']} Answer: {f['answer']}",
        "source": "FAQ.json"
    })

with open(os.path.join(base_path, 'knowledge_base.json'), 'w') as f:
    json.dump(knowledge_base, f, indent=2)

print(f"Successfully consolidated {len(knowledge_base)} chunks into knowledge_base.json")
