from pydantic import BaseModel


class Credentials(BaseModel):
    url: str
    org: str
    token: str


class QueryRequest(BaseModel):
    query: str
    type: str = "flux"
