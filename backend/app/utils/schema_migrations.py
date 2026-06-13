from sqlalchemy import text
from sqlalchemy.engine import Engine


def column_exists(engine: Engine, table_name: str, column_name: str) -> bool:
    query = text(
        """
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table_name
          AND COLUMN_NAME = :column_name
        """
    )
    with engine.connect() as conn:
        return conn.execute(
            query,
            {"table_name": table_name, "column_name": column_name},
        ).scalar() > 0


def foreign_key_exists(engine: Engine, constraint_name: str) -> bool:
    query = text(
        """
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
          AND CONSTRAINT_TYPE = 'FOREIGN KEY'
          AND CONSTRAINT_NAME = :constraint_name
        """
    )
    with engine.connect() as conn:
        return conn.execute(query, {"constraint_name": constraint_name}).scalar() > 0


def foreign_key_on_column_exists(engine: Engine, table_name: str, column_name: str) -> bool:
    query = text(
        """
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table_name
          AND COLUMN_NAME = :column_name
          AND REFERENCED_TABLE_NAME IS NOT NULL
        """
    )
    with engine.connect() as conn:
        return conn.execute(
            query,
            {"table_name": table_name, "column_name": column_name},
        ).scalar() > 0


def ensure_schema(engine: Engine) -> None:
    """Apply small compatibility migrations for existing local databases."""
    if not column_exists(engine, "departments", "location_id"):
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    ALTER TABLE departments
                    ADD COLUMN location_id INT NULL AFTER name
                    """
                )
            )

    if not column_exists(engine, "users", "department_id"):
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN department_id INT NULL AFTER role
                    """
                )
            )

    if not column_exists(engine, "users", "location_id"):
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN location_id INT NULL AFTER department_id
                    """
                )
            )

    if not foreign_key_on_column_exists(engine, "users", "department_id"):
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD CONSTRAINT fk_users_department_id
                    FOREIGN KEY (department_id) REFERENCES departments(id)
                    ON DELETE SET NULL
                    """
                )
            )

    if not foreign_key_on_column_exists(engine, "users", "location_id"):
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD CONSTRAINT fk_users_location_id
                    FOREIGN KEY (location_id) REFERENCES locations(id)
                    ON DELETE SET NULL
                    """
                )
            )

    if not foreign_key_on_column_exists(engine, "departments", "location_id"):
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    ALTER TABLE departments
                    ADD CONSTRAINT fk_departments_location_id
                    FOREIGN KEY (location_id) REFERENCES locations(id)
                    ON DELETE SET NULL
                    """
                )
            )
