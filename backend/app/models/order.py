from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    items = Column(JSON, nullable=False)
    total = Column(String, nullable=False)
    notes = Column(String, default="")
    status = Column(String, default="pending")  # pending -> preparing -> ready -> completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())