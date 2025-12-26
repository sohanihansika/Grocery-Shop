from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Database URL
db_url = "postgresql://postgres:postgres@localhost:5433/telusko"
engine = create_engine(db_url)

# session is a sessionmaker factory. Call session() to get a Session instance.
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
	"""Dependency for FastAPI endpoints. Yields a SQLAlchemy Session and ensures
	it is closed after use.
	"""
	db = session()
	try:
		yield db
	finally:
		db.close()