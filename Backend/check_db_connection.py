import os
import sys

import psycopg2


def _mask(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 4:
        return "*" * len(value)
    return value[:2] + ("*" * (len(value) - 4)) + value[-2:]


def load_connection_params():
    # Manual Supabase PostgreSQL configuration (no DATABASE_URL logic).
    host = "db.dwkkqezbsupayuskgdqo.supabase.co"
    port = "5432"
    dbname = "postgres"
    user = "postgres"
    password = os.getenv("DB_PASSWORD", "")

    if not password:
        raise ValueError("Missing DB_PASSWORD environment variable")

    return {
        "mode": "manual",
        "connect": {
            "host": host,
            "port": port,
            "dbname": dbname,
            "user": user,
            "password": password,
            "sslmode": "require",
            "connect_timeout": 10,
        },
        "meta": {"host": host, "port": str(port), "dbname": dbname, "user": user},
    }


def main() -> int:
    try:
        cfg = load_connection_params()
    except Exception as exc:
        print("DB config error:", exc)
        return 2

    meta = cfg["meta"]
    print("DB source:", cfg["mode"])
    print("Host:", meta["host"])
    print("Port:", meta["port"])
    print("Database:", meta["dbname"])
    print("User:", _mask(meta["user"]))

    try:
        with psycopg2.connect(**cfg["connect"]) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.execute(
                    "SELECT current_database(), current_user, version()"
                )
                dbname, dbuser, version = cur.fetchone()
                print("Connection OK")
                print("Connected DB:", dbname)
                print("Connected User:", dbuser)
                print("PostgreSQL:", version.split(" ")[1])
        return 0
    except Exception as exc:
        print("Connection FAILED")
        print(type(exc).__name__ + ":", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
