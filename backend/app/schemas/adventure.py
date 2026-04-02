from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class StartAdventureRequest(BaseModel):
    genre: str        # fantasy, horror, sci-fi, mystery
    setting: str      # medieval castle, space station, haunted house
    character_name: str
    character_class: str  # warrior, mage, rogue, explorer

class ChoiceRequest(BaseModel):
    choice: str       # "Choice 1", "Choice 2", "Choice 3"

class StoryNodeResponse(BaseModel):
    sequence_number: int
    story_text: str
    choice_made: Optional[str]

    class Config:
        from_attributes = True

class AdventureSessionResponse(BaseModel):
    id: UUID
    genre: str
    setting: str
    character_name: str
    character_class: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AdventureStateResponse(BaseModel):
    session: AdventureSessionResponse
    current_story: str
    choices: List[str]
    turn_number: int
    is_ended: bool = False          
