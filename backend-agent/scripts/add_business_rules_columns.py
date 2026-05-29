#!/usr/bin/env python3
"""Add business rules columns to users table. Run once for existing databases.
Usage: cd backend-agent && python -m scripts.add_business_rules_columns
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.database import engine


async def main():
    cols = [
        ("commission_rate", "NUMERIC(5,2)", "10"),
        ("total_bet_limit", "NUMERIC(18,0)", "5000000"),
        ("single_number_limit", "NUMERIC(18,0)", "500000"),
        ("payout_2d", "INTEGER", "80"),
        ("payout_3d", "INTEGER", "500"),
    ]
    async with engine.begin() as conn:
        for col, sql_type, default in cols:
            try:
                await conn.execute(text(
                    f"ALTER TABLE users ADD COLUMN {col} {sql_type} DEFAULT {default}"
                ))
                print(f"Added column {col}")
            except Exception as e:
                err = str(e).lower()
                if "duplicate" in err or "already exists" in err:
                    print(f"Column {col} already exists, skipping")
                else:
                    raise


if __name__ == "__main__":
    asyncio.run(main())
