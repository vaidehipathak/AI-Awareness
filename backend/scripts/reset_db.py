import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'ai_awareness_db')
DB_USER = os.getenv('DB_USER', 'ai_awareness_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'strongpassword')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '5432'))

# Connect to the postgres maintenance DB
conn_params = {
    'dbname': 'postgres',
    'user': DB_USER,
    'password': DB_PASSWORD,
    'host': DB_HOST,
    'port': DB_PORT,
}

def main():
    print(f"Resetting database '{DB_NAME}' on {DB_HOST}:{DB_PORT} as user '{DB_USER}'...")
    try:
        # Try full drop/create via maintenance DB (requires CREATEDB privilege)
        conn = psycopg2.connect(**conn_params)
        try:
            conn.autocommit = True
            cur = conn.cursor()
            try:
                cur.execute(
                    """
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = %s AND pid <> pg_backend_pid();
                    """,
                    (DB_NAME,),
                )
                cur.execute(f'DROP DATABASE IF EXISTS "{DB_NAME}";')
                cur.execute(f'CREATE DATABASE "{DB_NAME}" WITH OWNER = {DB_USER};')
                print("Database dropped and recreated.")
                return
            finally:
                cur.close()
        finally:
            conn.close()
    except Exception as e:
        print(f"Full DB recreate not permitted ({e}). Falling back to schema reset...")

    # Fallback: reset schema in-place
    target_params = {
        'dbname': DB_NAME,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'host': DB_HOST,
        'port': DB_PORT,
    }
    conn2 = psycopg2.connect(**target_params)
    try:
        conn2.autocommit = True
        cur2 = conn2.cursor()
        try:
            cur2.execute('DROP SCHEMA public CASCADE;')
            cur2.execute('CREATE SCHEMA public;')
            # Ensure standard privileges
            cur2.execute('GRANT ALL ON SCHEMA public TO postgres;')
            cur2.execute(f'GRANT ALL ON SCHEMA public TO {DB_USER};')
            print("Schema reset complete.")
        finally:
            cur2.close()
    finally:
        conn2.close()
    print("Database reset complete.")

if __name__ == '__main__':
    main()
