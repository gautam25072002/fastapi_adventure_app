from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class AdventureSession(Base):
    __tablename__ = "adventure_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    genre = Column(String, nullable=False)
    setting = Column(String, nullable=False)
    character_name = Column(String, nullable=False)
    character_class = Column(String, nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="sessions")
    story_nodes = relationship("StoryNode", back_populates="session")


class StoryNode(Base):
    __tablename__ = "story_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("adventure_sessions.id"), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    story_text = Column(Text, nullable=False)
    choices = Column(ARRAY(Text), nullable=True)  # store choices directly
    choice_made = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("AdventureSession", back_populates="story_nodes")