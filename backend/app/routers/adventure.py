from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.adventure import AdventureSession, StoryNode
from app.schemas.adventure import (
    StartAdventureRequest, ChoiceRequest,
    AdventureSessionResponse, AdventureStateResponse
)
from app.services.ai import generate_opening, generate_next_scene, should_story_end, generate_ending
from typing import List

router = APIRouter(prefix="/adventure", tags=["Adventure"])


@router.post("/start", response_model=AdventureStateResponse)
def start_adventure(
    payload: StartAdventureRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    story_text, choices = generate_opening(
        payload.genre,
        payload.setting,
        payload.character_name,
        payload.character_class
    )

    session = AdventureSession(
        user_id=current_user.id,
        genre=payload.genre,
        setting=payload.setting,
        character_name=payload.character_name,
        character_class=payload.character_class
    )
    db.add(session)
    db.flush()

    node = StoryNode(
        session_id=session.id,
        sequence_number=1,
        story_text=story_text,
        choices=choices,
        choice_made=None
    )
    db.add(node)
    db.commit()
    db.refresh(session)

    return AdventureStateResponse(
        session=session,
        current_story=story_text,
        choices=choices,
        turn_number=1,
        is_ended=False
    )


@router.post("/{session_id}/choice", response_model=AdventureStateResponse)
def make_choice(
    session_id: UUID,
    payload: ChoiceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AdventureSession).filter(
        AdventureSession.id == session_id,
        AdventureSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="This adventure has already ended")

    nodes = db.query(StoryNode).filter(
        StoryNode.session_id == session_id
    ).order_by(StoryNode.sequence_number).all()

    latest_node = nodes[-1]
    latest_node.choice_made = payload.choice

    history = [
        {"story": node.story_text, "choice": node.choice_made}
        for node in nodes[:-1]
    ]

    story_text, choices = generate_next_scene(
        session.genre,
        session.setting,
        session.character_name,
        session.character_class,
        history,
        payload.choice
    )

    next_turn = latest_node.sequence_number + 1

    # Check if story should end
    if should_story_end(story_text, next_turn):
        ending_text = generate_ending(story_text, session.character_name)

        # Mark session as completed
        session.status = "completed"
        session.ended_at = datetime.now(timezone.utc)

        final_node = StoryNode(
            session_id=session.id,
            sequence_number=next_turn,
            story_text=ending_text,
            choices=[],
            choice_made=None
        )
        db.add(final_node)
        db.commit()
        db.refresh(session)

        return AdventureStateResponse(
            session=session,
            current_story=ending_text,
            choices=[],
            turn_number=next_turn,
            is_ended=True
        )

    # Story continues
    new_node = StoryNode(
        session_id=session.id,
        sequence_number=next_turn,
        story_text=story_text,
        choices=choices,
        choice_made=None
    )
    db.add(new_node)
    db.commit()
    db.refresh(session)

    return AdventureStateResponse(
        session=session,
        current_story=story_text,
        choices=choices,
        turn_number=next_turn,
        is_ended=False
    )


@router.get("/", response_model=List[AdventureSessionResponse])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(AdventureSession).filter(
        AdventureSession.user_id == current_user.id
    ).order_by(AdventureSession.created_at.desc()).all()
    return sessions


@router.get("/{session_id}", response_model=AdventureStateResponse)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AdventureSession).filter(
        AdventureSession.id == session_id,
        AdventureSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    nodes = db.query(StoryNode).filter(
        StoryNode.session_id == session_id
    ).order_by(StoryNode.sequence_number).all()

    if not nodes:
        raise HTTPException(status_code=404, detail="No story found")

    latest = nodes[-1]
    is_ended = session.status == "completed"

    return AdventureStateResponse(
        session=session,
        current_story=latest.story_text,
        choices=latest.choices or [],
        turn_number=latest.sequence_number,
        is_ended=is_ended
    )