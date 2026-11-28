import sqlite3
conn = sqlite3.connect("backend/interviai.db")
c = conn.cursor()

# List tables
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in c.fetchall()]
print("=== TABLES ===")
for t in tables:
    print(f"  {t}")

# Show schema for key tables
for t in tables:
    if t.startswith("alembic") or t.startswith("sqlite"):
        continue
    print(f"\n=== {t} ===")
    c.execute(f"PRAGMA table_info({t})")
    for col in c.fetchall():
        print(f"  {col[1]:30s} {col[2]:15s} nullable={not col[3]}  default={col[4]}")

conn.close()
