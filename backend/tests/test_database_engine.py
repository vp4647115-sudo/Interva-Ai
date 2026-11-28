from sqlalchemy.pool import NullPool

from app.db.session import _create_engine, _unique_prepared_statement_name


def test_supabase_pooler_uses_unique_prepared_statement_names() -> None:
    engine = _create_engine(
        "postgresql+asyncpg://user:password@aws-0-region.pooler.supabase.com:6543/postgres"
    )
    try:
        assert isinstance(engine.pool, NullPool)
        assert (
            _unique_prepared_statement_name()
            != _unique_prepared_statement_name()
        )
    finally:
        engine.sync_engine.dispose()


def test_direct_postgres_keeps_standard_connection_pool() -> None:
    engine = _create_engine("postgresql+asyncpg://user:password@db.example.com/postgres")
    try:
        assert not isinstance(engine.pool, NullPool)
    finally:
        engine.sync_engine.dispose()
