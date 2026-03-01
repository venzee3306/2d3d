from pydantic import BaseModel


class SessionCreate(BaseModel):
    round_name: str  # Morning | Evening
    date: str  # YYYY-MM-DD


class SessionResponse(BaseModel):
    id: str
    player_id: str
    round_name: str
    date: str

    class Config:
        from_attributes = True
